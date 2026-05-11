'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readJsonResponse, unwrapApiData } from '@/lib/api';

export default function CourseResumePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const courseId = params.id;
    
    useEffect(() => {
        const resume = async () => {
            try {
                const res = await fetch(`/api/lms/enrollment/${courseId}`);
                const enrollment = unwrapApiData(await readJsonResponse(res));
                
                if (enrollment?.currentLesson) {
                    router.replace(`/lms/learn/${courseId}/lesson/${enrollment.currentLesson._id || enrollment.currentLesson}`);
                } else {
                    const syllabusRes = await fetch(`/api/lms/courses/${courseId}/syllabus`);
                    const syllabus = unwrapApiData(await readJsonResponse(syllabusRes));
                    const firstLesson = Array.isArray(syllabus) ? syllabus[0]?.lessons?.[0] : syllabus?.lessons?.[0];
                    if (firstLesson) {
                        router.replace(`/lms/learn/${courseId}/lesson/${firstLesson._id}`);
                    }
                }
            } catch (err) {
                console.error('Failed to resume', err);
            }
        };
        resume();
    }, [courseId, router]);
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-sm font-medium text-zinc-400">Resuming where you left off...</p>
            </div>
        </div>
    );
}
