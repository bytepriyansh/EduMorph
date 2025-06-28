"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { IconType } from 'react-icons';

interface ApplicationVisionCardProps {
    title: string;
    description: string | string[];
    icon: IconType;
    className?: string;
}

export const ApplicationVisionCard: React.FC<ApplicationVisionCardProps> = ({
    title,
    description,
    icon: Icon,
    className = '',
}) => {
    return (
        <Card className={`glass-effect hover:scale-[1.02] transition-transform ${className}`}>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {Array.isArray(description) ? (
                    <ul className="space-y-2">
                        {description.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardContent>
        </Card>
    );
};

export const ApplicationVisionCardSkeleton = () => (
    <Card className="glass-effect animate-pulse">
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <div className="p-2 rounded-lg bg-muted">
                <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
            </div>
            <div className="w-3/4 h-6 bg-muted-foreground/20 rounded" />
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-full h-4 bg-muted-foreground/10 rounded" />
                ))}
            </div>
        </CardContent>
    </Card>
);