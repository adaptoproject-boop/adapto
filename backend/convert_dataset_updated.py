import openpyxl
import json
import os

wb_path = r'D:\web\client\sakshi\document\updated dataset.xlsx'
wb = openpyxl.load_workbook(wb_path)
ws = wb['Curriculum Dataset']

curriculum = []
rows = list(ws.iter_rows(values_only=True))
headers = [str(h) if h is not None else f"Col{i}" for i, h in enumerate(rows[0])]

# Find index for each column header
idx_map = {h: i for i, h in enumerate(headers)}

for row in rows[1:]:
    if row[idx_map['ID']] is None:
        continue
        
    age_group = str(row[idx_map['AGE GROUP']]) if row[idx_map['AGE GROUP']] is not None else ""
    
    # Map AGE GROUP to difficulty for compatibility
    if age_group == '2-4':
        difficulty = 'Easy'
    elif age_group == '5-7':
        difficulty = 'Medium'
    elif age_group == '8-10':
        difficulty = 'Hard'
    else:
        difficulty = 'Easy'
        
    quiz_str = row[idx_map['QUIZ DATA']]
    quiz_data = []
    if quiz_str:
        try:
            quiz_data = json.loads(quiz_str)
        except Exception as e:
            print(f"Error parsing quiz JSON for ID {row[idx_map['ID']]}: {e}")
            quiz_data = []

    lesson = {
        'id': str(row[idx_map['ID']]),
        'subject': str(row[idx_map['SUBJECT']]),
        'topic': str(row[idx_map['TOPIC']]),
        'difficulty': difficulty,
        'sequence_order': int(row[idx_map['SEQUENCE ORDER']]) if row[idx_map['SEQUENCE ORDER']] is not None else 1,
        'grade_level': str(row[idx_map['GRADE LEVEL']]) if row[idx_map['GRADE LEVEL']] is not None else "",
        'age_range': age_group,
        'age_label': str(row[idx_map['AGE LABEL']]) if row[idx_map['AGE LABEL']] is not None else "",
        'learning_objective': str(row[idx_map['LEARNING OBJECTIVE']]) if row[idx_map['LEARNING OBJECTIVE']] is not None else "",
        'estimated_duration_min': int(row[idx_map['ESTIMATED DURATION MIN']]) if row[idx_map['ESTIMATED DURATION MIN']] is not None else 10,
        'video_url': str(row[idx_map['VIDEO URL']]) if row[idx_map['VIDEO URL']] is not None else "",
        'tags': str(row[idx_map['TAGS']]) if row[idx_map['TAGS']] is not None else "",
        'question_mode': str(row[idx_map['QUESTION MODE']]) if row[idx_map['QUESTION MODE']] is not None else "",
        'quiz_data': quiz_data,
        'min_pass_score': int(row[idx_map['MIN PASS SCORE']]) if row[idx_map['MIN PASS SCORE']] is not None else 70,
        'prerequisite_topic_id': str(row[idx_map['PREREQUISITE TOPIC ID']]) if row[idx_map['PREREQUISITE TOPIC ID']] not in (None, 'None', '') else None,
        'adaptive_hint': str(row[idx_map['ADAPTIVE HINT']]) if row[idx_map['ADAPTIVE HINT']] is not None else ""
    }
    curriculum.append(lesson)

out_path = os.path.join(os.path.dirname(__file__), 'data', 'curriculum.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(curriculum, f, ensure_ascii=False, indent=2)

print(f"Successfully converted and saved {len(curriculum)} lessons to curriculum.json!")
