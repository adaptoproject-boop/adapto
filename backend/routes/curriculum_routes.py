"""
Curriculum Routes — Serve adaptive curriculum from the dataset.

Endpoints:
    GET  /api/curriculum/all
    GET  /api/curriculum/subject/<subject>
    POST /api/curriculum/next          body: { current_id, decision }
"""

import json
import os
from flask import Blueprint, jsonify, request

curriculum_bp = Blueprint('curriculum', __name__)

# ---------------------------------------------------------------------------
# Load curriculum once at import time
# ---------------------------------------------------------------------------
_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'curriculum.json')

def _load_curriculum():
    with open(_DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

CURRICULUM = _load_curriculum()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_lesson_by_id(lesson_id: str):
    """Return a single lesson dict by its UUID."""
    return next((l for l in CURRICULUM if l['id'] == lesson_id), None)


def get_lessons_for_subject(subject: str):
    """Return lessons for a subject ordered Easy → Medium → Hard."""
    diff_order = {'Easy': 1, 'Medium': 2, 'Hard': 3}
    lessons = [l for l in CURRICULUM if l['subject'].lower() == subject.lower()]
    return sorted(lessons, key=lambda l: diff_order.get(l['difficulty'], 99))


def get_next_lesson(current_id: str, decision: str):
    """
    Given a current lesson ID and adaptive decision, return the next lesson.

    decision values:
        'easy'  → find the Easy lesson in the same subject
        'same'  → find same difficulty, next sequence_order (or wrap to same)
        'hard'  → find the Hard lesson in the same subject
    """
    current = get_lesson_by_id(current_id)
    if not current:
        return None

    subject = current['subject']
    subject_lessons = get_lessons_for_subject(subject)

    diff_map = {
        'easy': 'Easy',
        'same': current['difficulty'],
        'hard': 'Hard',
    }
    target_difficulty = diff_map.get(decision.lower(), current['difficulty'])

    # Try exact difficulty match
    candidates = [l for l in subject_lessons if l['difficulty'] == target_difficulty]

    # Don't serve the same lesson again if there's another option
    if len(candidates) > 1:
        candidates = [l for l in candidates if l['id'] != current_id]

    if candidates:
        # Pick the one with the lowest sequence_order (first in sequence)
        return sorted(candidates, key=lambda l: l['sequence_order'])[0]

    # Fallback: return the current lesson itself
    return current


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@curriculum_bp.route('/all', methods=['GET'])
def get_all_lessons():
    """Return every lesson in the curriculum."""
    diff_order = {'Easy': 1, 'Medium': 2, 'Hard': 3}
    sorted_curriculum = sorted(
        CURRICULUM,
        key=lambda l: (l['subject'], diff_order.get(l['difficulty'], 99))
    )
    return jsonify({
        'success': True,
        'count': len(sorted_curriculum),
        'lessons': sorted_curriculum
    })


@curriculum_bp.route('/subject/<path:subject>', methods=['GET'])
def get_subject_lessons(subject):
    """Return lessons for one subject, ordered Easy → Medium → Hard."""
    lessons = get_lessons_for_subject(subject)
    if not lessons:
        return jsonify({'success': False, 'message': f'No lessons found for subject: {subject}'}), 404
    return jsonify({
        'success': True,
        'subject': subject,
        'count': len(lessons),
        'lessons': lessons
    })


@curriculum_bp.route('/next', methods=['POST'])
def get_next_adaptive_lesson():
    """
    Return the next lesson given the adaptive decision.

    Request body:
        {
            "current_id": "<uuid>",
            "decision":   "easy" | "same" | "hard",
            "subject":    "<optional fallback>"
        }
    """
    data = request.get_json() or {}
    current_id = data.get('current_id')
    decision   = data.get('decision', 'same')
    subject    = data.get('subject')

    if not current_id and not subject:
        return jsonify({'success': False, 'message': 'current_id or subject required'}), 400

    # If no current_id but subject given, return the easiest lesson
    if not current_id and subject:
        lessons = get_lessons_for_subject(subject)
        if not lessons:
            return jsonify({'success': False, 'message': 'No lessons for subject'}), 404
        return jsonify({'success': True, 'lesson': lessons[0]})

    next_lesson = get_next_lesson(current_id, decision)
    if not next_lesson:
        return jsonify({'success': False, 'message': 'Lesson not found'}), 404

    return jsonify({'success': True, 'lesson': next_lesson})


@curriculum_bp.route('/lesson/<lesson_id>', methods=['GET'])
def get_lesson(lesson_id):
    """Return a single lesson by its UUID."""
    lesson = get_lesson_by_id(lesson_id)
    if not lesson:
        return jsonify({'success': False, 'message': 'Lesson not found'}), 404
    return jsonify({'success': True, 'lesson': lesson})
