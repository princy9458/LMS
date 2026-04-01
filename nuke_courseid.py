import os
import shutil

root_to_search = r'd:\Projects\lms-one\app'
print(f"Searching in {root_to_search}")

found = []
for root, dirs, files in os.walk(root_to_search):
    for d in dirs:
        if d == '[courseId]':
            found.append(os.path.join(root, d))

if not found:
    print("No directories named [courseId] found.")
else:
    for path in found:
        print(f"Found: {path}")
        try:
            print(f"Attempting to delete: {path}")
            # Try to rename first to break locks
            temp_path = path + "_todelete"
            os.rename(path, temp_path)
            shutil.rmtree(temp_path)
            print(f"Successfully deleted: {path}")
        except Exception as e:
            print(f"Failed to delete {path}: {e}")
            try:
                shutil.rmtree(path)
                print(f"Successfully deleted on second try: {path}")
            except Exception as e2:
                print(f"Final failure for {path}: {e2}")
