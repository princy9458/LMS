import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Users } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-muted">
      <div className="aspect-video w-full bg-muted relative">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            <BookOpen size={48} />
          </div>
        )}
        <Badge className="absolute top-3 right-3 shadow-sm bg-primary text-primary-foreground">
          {course.category}
        </Badge>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-1">
          <Badge variant="outline" className="text-[10px] h-5">
            {course.level}
          </Badge>
          <span className="text-sm font-bold text-primary">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-2 leading-snug">
          {course.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen size={14} />
            <span>{course.modules?.length || 0} Modules</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>Enrolled Students</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t mt-auto">
        <Link href={`/lms/course/${course._id}`} className="w-full mt-4">
          <Button variant="default" className="w-full font-medium">
            View Syllabus
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
