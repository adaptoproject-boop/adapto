import jwt
import datetime
import os
from functools import wraps
from flask import request, jsonify

def generate_token(user_id):
    payload = {
        'id': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')

def verify_token(token):
    if not token:
        return None
    try:
        data = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
        from config.db import connect_db
        supabase = connect_db()
        if not supabase:
            return None
        result = supabase.table('users').select('*').eq('id', data['id']).execute()
        return result.data[0] if result.data else None
    except:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
            from config.db import connect_db
            supabase = connect_db()
            if not supabase:
                return jsonify({'message': 'Database connection error!'}), 500
            
            result = supabase.table('users').select('*').eq('id', data['id']).execute()
            if not result.data:
                return jsonify({'message': 'User not found!'}), 404
                
            user = result.data[0]
            # Map id to _id for backward compatibility with code using user['_id']
            user['_id'] = user['id']
            request.user = user
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(*args, **kwargs)
    
    return decorated
