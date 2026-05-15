import openpyxl, json, sys, os

wb = openpyxl.load_workbook(r'D:\web\client\sakshi\document\adapto_curriculum_dataset.xlsx')
ws = wb.active

curriculum = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[0] is None:
        continue
    lesson = {
        'id': str(row[0]),
        'subject': row[1],
        'topic': row[2],
        'difficulty': row[3],
        'sequence_order': row[4],
        'grade_level': row[5],
        'age_range': str(row[6]) if row[6] else None,
        'learning_objective': row[7],
        'estimated_duration_min': row[8],
        'video_url': row[9],
        'tags': row[10],
        'quiz_data': json.loads(row[11]) if row[11] else [],
        'min_pass_score': row[12],
        'prerequisite_topic_id': str(row[13]) if row[13] else None,
        'adaptive_hint': row[14]
    }
    curriculum.append(lesson)

out_path = os.path.join(os.path.dirname(__file__), 'data', 'curriculum.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(curriculum, f, ensure_ascii=False, indent=2)

print(f"Saved {len(curriculum)} lessons to curriculum.json")
subjects = {}
for l in curriculum:
    subjects.setdefault(l['subject'], []).append(l['topic'] + ' [' + l['difficulty'] + ']')
for s, topics in subjects.items():
    print(f"  {s}: {topics}")
