"""
Report Routes - PDF Report Generation with Local Logic
"""

from flask import Blueprint, request, send_file, jsonify
from datetime import datetime
import io
import os
from config.db import connect_db

# ReportLab imports for PDF generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

report_bp = Blueprint('report', __name__)
supabase = connect_db()

def get_local_summary(student_name, stats, weak_topics, strong_topics):
    """
    Generate a progress report summary using rule-based templates.
    """
    avg = stats['average_score']
    passed = stats['passed_quizzes']
    total = stats['total_quizzes']
    
    summary = f"Progress Report for {student_name}\n\n"
    
    if avg >= 80:
        summary += f"{student_name} is performing exceptionally well! With an average score of {avg}%, they have shown a strong grasp of the material. "
    elif avg >= 60:
        summary += f"{student_name} is making good progress. Their average score of {avg}% indicates they are learning effectively, though there is room for further improvement. "
    else:
        summary += f"{student_name} is currently developing their skills. While they have completed {total} quizzes, an average score of {avg}% suggests they would benefit from more focused practice. "
    
    if strong_topics:
        summary += f"Specific strengths were observed in {', '.join(strong_topics)}. "
    
    if weak_topics:
        summary += f"We recommend additional focus on {', '.join(weak_topics)} to build more confidence. "
    else:
        summary += "They are maintaining a consistent performance across all attempted topics. "
        
    summary += "\n\nKeep up the great work! Consistent practice is the key to mastering new skills."
    
    return summary

@report_bp.route('/generate-report/<student_id>', methods=['GET'])
def generate_report(student_id):
    """
    Generate and return a PDF report for the student using Supabase data.
    """
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        # fetch student info
        user_res = supabase.table('users').select('*').eq('id', student_id).execute()
        if not user_res.data:
            return jsonify({'error': 'Student not found'}), 404
        student = user_res.data[0]

        # fetch quiz results
        quiz_res = supabase.table('quiz_results').select('*').eq('user_id', student_id).order('timestamp', desc=True).execute()
        quiz_results = quiz_res.data

        # Calculate Stats
        total_quizzes = len(quiz_results)
        if total_quizzes == 0:
            return jsonify({'error': 'No quiz data available to generate report'}), 400

        passed_quizzes = sum(1 for r in quiz_results if r.get('passed', False))
        avg_score = sum(r.get('score', 0) for r in quiz_results) / total_quizzes
        avg_score = round(avg_score, 1)

        # Topic Analysis
        topic_scores = {}
        for r in quiz_results:
            topic = r.get('lesson_title', r.get('subject', 'General'))
            score = r.get('score', 0)
            if topic not in topic_scores:
                topic_scores[topic] = []
            topic_scores[topic].append(score)
        
        strong_topics = []
        weak_topics = []
        
        for topic, scores in topic_scores.items():
            topic_avg = sum(scores) / len(scores)
            if topic_avg >= 80:
                strong_topics.append(topic)
            elif topic_avg < 60:
                weak_topics.append(topic)

        # Get Local Summary (No LLM)
        summary_text = get_local_summary(student['name'], {
            'total_quizzes': total_quizzes,
            'passed_quizzes': passed_quizzes,
            'average_score': avg_score
        }, weak_topics, strong_topics)

        # ==========================================
        # GENERATE PDF WITH REPORTLAB
        # ==========================================
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#4F46E5'),
            alignment=1
        )
        story.append(Paragraph("Student Progress Report", title_style))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%Y-%m-%d')}", styles['Normal']))
        story.append(Spacer(1, 12))

        # Student Info Header
        story.append(Paragraph(f"<b>Student Name:</b> {student['name']}", styles['Heading2']))
        story.append(Paragraph(f"<b>Total Stars:</b> {student.get('stars', 0)} ⭐", styles['Normal']))
        story.append(Spacer(1, 20))

        # Summary Section
        story.append(Paragraph("Progress Summary", styles['Heading2']))
        
        ai_text_style = ParagraphStyle(
            'SummaryText',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            backColor=colors.HexColor('#F3F4F6'),
            borderPadding=10
        )
        story.append(Paragraph(summary_text.replace('\n', '<br/>'), ai_text_style))
        story.append(Spacer(1, 20))

        # Performance Statistics Table
        story.append(Paragraph("Performance Overview", styles['Heading2']))
        
        data = [
            ['Metric', 'Value'],
            ['Total Quizzes', str(total_quizzes)],
            ['Quizzes Passed', str(passed_quizzes)],
            ['Average Score', f"{avg_score}%"],
            ['Completion Rate', f"{round((passed_quizzes/total_quizzes)*100, 1)}%"]
        ]
        
        t = Table(data, colWidths=[3*inch, 2*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366F1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#E0E7FF')),
            ('GRID', (0, 0), (-1, -1), 1, colors.white)
        ]))
        story.append(t)
        story.append(Spacer(1, 20))

        # Recent Activity
        story.append(Paragraph("Recent Quiz Activity", styles['Heading3']))
        
        activity_data = [['Date', 'Topic', 'Score', 'Status']]
        for r in quiz_results[:5]:
            date_str = r.get('timestamp')[:10] if r.get('timestamp') else "N/A"
            score = r.get('score', 0)
            status = "Pass" if r.get('passed') else "Retry"
            activity_data.append([date_str, r.get('lesson_title', 'Unknown'), f"{score}%", status])
        
        t2 = Table(activity_data, colWidths=[1.5*inch, 2.5*inch, 1*inch, 1*inch])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#9CA3AF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey)
        ]))
        story.append(t2)

        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"Adapto_Report_{student['name']}_{datetime.now().strftime('%Y%m%d')}.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        print(f"Error generating PDF: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
