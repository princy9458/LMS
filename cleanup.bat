@echo off
echo Killing node processes...
taskkill /F /IM node.exe /T
echo Deleting conflicting directories...
rd /s /q "d:\Projects\lms-one\app\api\lms\courses\[courseId]"
rd /s /q "d:\Projects\lms-one\app\api\lms\enrollment\[courseId]"
rd /s /q "d:\Projects\lms-one\app\lms\learn\[courseId]"
echo Cleanup complete.
