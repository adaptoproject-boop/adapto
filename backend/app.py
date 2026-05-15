from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from config.db import connect_db
from config.mail import mail

load_dotenv()

from routes.auth_routes import auth_routes
from routes.lesson_routes import lesson_routes
from routes.quiz_routes import quiz_routes
from routes.user_routes import user_routes
from routes.youtube_routes import youtube_bp
from routes.gemini_routes import gemini_bp
from routes.adaptive_routes import adaptive_bp
from routes.analytics_routes import analytics_bp
from routes.learning_routes import learning_bp
from routes.teacher_routes import teacher_bp
from routes.voice_routes import voice_routes
from routes.report_routes import report_bp
from routes.video_routes import video_bp
from routes.curriculum_routes import curriculum_bp

app = Flask(__name__)

# Mail config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

mail.init_app(app)

# Register ALL blueprints BEFORE initializing CORS for best results
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(lesson_routes, url_prefix='/api/lessons')
app.register_blueprint(quiz_routes, url_prefix='/api/quiz')
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(youtube_bp, url_prefix='/api/youtube')
app.register_blueprint(gemini_bp, url_prefix='/api/gemini')
app.register_blueprint(adaptive_bp, url_prefix='/api/adaptive')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(learning_bp, url_prefix='/api/learning')
app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
app.register_blueprint(voice_routes, url_prefix='/api/voice')
app.register_blueprint(report_bp, url_prefix='/api/reports')
app.register_blueprint(video_bp, url_prefix='/api/video')
app.register_blueprint(curriculum_bp, url_prefix='/api/curriculum')

# Explicitly configure CORS to be very permissive for development
CORS(app, resources={r"/api/*": {"origins": "*"}}, 
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"])

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/api/routes')
def list_routes():
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        line = urllib.parse.unquote(f"{rule.endpoint:50s} {methods:20s} {rule}")
        output.append(line)
    return "<pre>" + "\n".join(output) + "</pre>"

@app.route('/')
def home():
    return "Adaptive E-Learning Flask API is running..."

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5612))
    app.run(port=port, debug=True, use_reloader=False)
