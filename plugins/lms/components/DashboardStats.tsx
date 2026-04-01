import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, BookOpen, GraduationCap } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, description, trend }) => {
  return (
    <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="pt-2">
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          <div className="flex items-center pt-1">
            {trend && (
              <span className="text-[10px] text-green-500 font-medium flex items-center gap-0.5">
                <TrendingUp size={10} />
                {trend}%
              </span>
            )}
            <p className="text-[10px] text-muted-foreground ml-1">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardStats = ({ stats }) => {
  const defaultItems = [
    { title: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpen, description: 'Live modules', trend: 12 },
    { title: 'Active Students', value: stats?.totalStudents || 0, icon: Users, description: 'Engaged learners', trend: 8 },
    { title: 'Enrollments', value: stats?.totalEnrollments || 0, icon: GraduationCap, description: 'Life-time signups', trend: 15 },
    { title: 'Avg. Progress', value: `${stats?.avgProgress || 0}%`, icon: TrendingUp, description: 'Completion rate', trend: 4 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {defaultItems.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </div>
  );
};

export default DashboardStats;
