import os
import shutil
import uuid

base = r'd:\Projects\lms-one'
# Move out of the 'app' directory to stop Next.js from seeing them
trash_bin = r'd:\Projects\lms-one\__TRASH_BIN__'
os.makedirs(trash_bin, exist_ok=True)

targets = [
    r'app\api\lms\courses\[courseId]',
    r'app\api\lms\enrollment\[courseId]',
    r'app\lms\learn\[courseId]'
]

for t in targets:
    src = os.path.join(base, t)
    if os.path.exists(src):
        dest = os.path.join(trash_bin, t.replace('\\', '_').replace('[', '').replace(']', '') + '_' + str(uuid.uuid4())[:8])
        print(f"Moving {src} to {dest}")
        try:
            shutil.move(src, dest)
            print("Successfully moved.")
        except Exception as e:
            print(f"Failed to move {src}: {e}")
            try:
                print(f"Attempting to rename {src} in place as fallback...")
                os.rename(src, src + "_LOCKED")
                print("Renamed.")
            except Exception as e2:
                print(f"Rename also failed: {e2}")

print("Done.")
