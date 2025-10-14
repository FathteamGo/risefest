import React from 'react';
import Card from './Card';

export default function LoadingCard() {
  return (
    <Card className="h-full flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg">
        <div className="w-full h-full bg-slate-200 loading-pulse"></div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="w-full h-4 bg-slate-200 loading-pulse rounded-md mb-2"></div>
        <div className="w-[80px] h-4 bg-slate-200 loading-pulse rounded-md mb-3"></div>
        <div className="space-y-1 mb-3">
          <div className="w-full h-3 bg-slate-200 loading-pulse rounded-md"></div>
          <div className="w-[120px] h-3 bg-slate-200 loading-pulse rounded-md"></div>
        </div>
        <div className="w-full h-8 bg-slate-200 loading-pulse rounded-lg mt-auto"></div>
      </div>
    </Card>
  );
}