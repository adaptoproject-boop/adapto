from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from config.db import connect_db
from config.mail import mail
from middleware.auth_middleware import generate_token
import random
import datetime
from flask_mail import Message

auth_routes = Blueprint('auth_routes', __name__)
bcrypt = Bcrypt()
supabase = connect_db()

@auth_routes.route('/register', methods=['POST'])
def register_user():
    if not supabase:
        return jsonify({'message': 'Database connection error'}), 500
        
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'kid')

    # Check if user exists
    existing_user = supabase.table('users').select('*').eq('email', email).execute()
    if existing_user.data:
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user_data = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'role': role,
        'level': 'easy',
        'points': 0,
        'stars': 0
    }
    
    result = supabase.table('users').insert(user_data).execute()
    if not result.data:
        return jsonify({'message': 'Registration failed'}), 500
        
    user = result.data[0]
    user_id = user['id']
    
    return jsonify({
        '_id': str(user_id),
        'name': name,
        'email': email,
        'role': role,
        'token': generate_token(user_id)
    }), 201

@auth_routes.route('/login', methods=['POST'])
def login_user():
    if not supabase:
        return jsonify({'message': 'Database connection error'}), 500

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    result = supabase.table('users').select('*').eq('email', email).execute()
    if not result.data:
        return jsonify({'message': 'Invalid email or password'}), 401
        
    user = result.data[0]

    if bcrypt.check_password_hash(user['password'], password):
        # Verify role matches if provided
        if role:
            if role == 'parent' and user.get('role') == 'kid':
                pass 
            elif user.get('role') != role:
                return jsonify({'message': f'This account is not a {role} account'}), 403
        
        return jsonify({
            '_id': str(user['id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'token': generate_token(user['id'])
        }), 200
    else:
        return jsonify({'message': 'Invalid email or password'}), 401

@auth_routes.route('/forgot-password', methods=['POST'])
def forgot_password():
    if not supabase:
        return jsonify({'message': 'Database connection error'}), 500

    data = request.get_json()
    email = data.get('email')
    
    result = supabase.table('users').select('*').eq('email', email).execute()
    if not result.data:
        return jsonify({'message': 'If this email exists, an OTP will be sent.'}), 200

    user = result.data[0]
    otp = str(random.randint(100000, 999999))
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    expiry = (now_utc + datetime.timedelta(minutes=10)).isoformat()
    
    supabase.table('users').update({
        'reset_otp': otp, 
        'reset_otp_expiry': expiry
    }).eq('id', user['id']).execute()
    
    try:
        msg = Message("Your Password Reset OTP", recipients=[email])
        msg.body = f"Your OTP for password reset is {otp}. It is valid for 10 minutes."
        mail.send(msg)
    except Exception as e:
        print("Failed to send email:", str(e))
        return jsonify({'message': 'Error sending email. Please try again later.'}), 500
        
    return jsonify({'message': 'If this email exists, an OTP will be sent.'}), 200

@auth_routes.route('/reset-password', methods=['POST'])
def reset_password():
    if not supabase:
        return jsonify({'message': 'Database connection error'}), 500

    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    
    result = supabase.table('users').select('*').eq('email', email).execute()
    if not result.data:
        print(f"[OTP Debug] User not found for email: {email}")
        return jsonify({'message': 'Account not found. Please check your email.'}), 400
        
    user = result.data[0]
    
    stored_otp = user.get('reset_otp')
    stored_expiry = user.get('reset_otp_expiry')
    
    print(f"[OTP Debug] email={email}, input_otp='{otp}' (type={type(otp).__name__}), stored_otp='{stored_otp}' (type={type(stored_otp).__name__}), expiry={stored_expiry}")
    
    if not stored_otp or not stored_expiry:
        return jsonify({'message': 'No OTP requested. Please request a new OTP.'}), 400
    
    # Cast both to string for safe comparison
    if str(stored_otp).strip() != str(otp).strip():
        return jsonify({'message': 'Invalid OTP. Please check and try again.'}), 400
        
    # Parse expiry — handle both timezone-aware and naive formats from Supabase
    try:
        expiry = datetime.datetime.fromisoformat(str(stored_expiry).replace('Z', '+00:00'))
        # Make comparison timezone-aware
        now = datetime.datetime.now(datetime.timezone.utc)
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=datetime.timezone.utc)
    except Exception as e:
        print(f"[OTP Debug] Expiry parse error: {e}")
        return jsonify({'message': 'OTP verification error. Please request a new OTP.'}), 400
    
    if now > expiry:
        return jsonify({'message': 'OTP has expired. Please request a new one.'}), 400
        
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    supabase.table('users').update({
        'password': hashed_password,
        'reset_otp': None,
        'reset_otp_expiry': None
    }).eq('id', user['id']).execute()
    
    return jsonify({'message': 'Password reset successful'}), 200
