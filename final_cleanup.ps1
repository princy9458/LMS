$paths = @(
    "d:\Projects\lms-one\app\api\lms\courses\[courseId]",
    "d:\Projects\lms-one\app\api\lms\enrollment\[courseId]",
    "d:\Projects\lms-one\app\lms\learn\[courseId]"
)

foreach ($path in $paths) {
    if (Test-Path -LiteralPath $path) {
        Write-Host "Deleting $path"
        Remove-Item -LiteralPath $path -Recurse -Force
    } else {
        Write-Host "$path not found"
    }
}
