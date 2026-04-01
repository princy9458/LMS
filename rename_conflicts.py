import os

targets = [
    r'd:\Projects\lms-one\app\api\lms\courses\[courseId]\syllabus\route.ts',
    r'd:\Projects\lms-one\app\api\lms\enrollment\[courseId]\route.ts',
    r'd:\Projects\lms-one\app\lms\learn\[courseId]\page.tsx',
    r'd:\Projects\lms-one\app\lms\learn\[courseId]\lesson\[lessonId]\page.tsx'
]

for t in targets:
    if os.path.exists(t):
        try:
            new_name = t + '.bak'
            os.rename(t, new_name)
            print(f"Renamed {t} to {new_name}")
        except Exception as e:
            print(f"Error renaming {t}: {e}")
    else:
        print(f"File not found: {t}")
