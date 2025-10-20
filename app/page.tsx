// 'use client';

// import { useEffect, useState, FormEvent } from 'react';
// import { eventService } from '@/lib/data-service';
// import type { Event } from '@/types';
// import EventCard from '@/components/ui/EventCard';
// import Container from '@/components/ui/Container';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import LoadingCard from '@/components/ui/LoadingCard';

// export default function Home() {
//   const [latestEvents, setLatestEvents] = useState<Event[]>([]);
//   const [eventsByCategory, setEventsByCategory] = useState<Record<string, Event[]>>({});
//   const [searchResults, setSearchResults] = useState<Event[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [searching, setSearching] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const events = await eventService.getAllEvents();
//         const allEvents = events;

//         // latest
//         const sorted = [...allEvents].sort(
//           (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//         );
//         setLatestEvents(sorted.slice(0, 6));

//         // group by location
//         const grouped: Record<string, Event[]> = {};
//         allEvents.forEach((ev) => {
//           const key = ev.location || 'Others';
//           (grouped[key] ??= []).push(ev);
//         });
//         setEventsByCategory(grouped);
//       } catch (e) {
//         console.error('Error fetching events:', e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleSearch = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) {
//       setSearchResults([]);
//       return;
//     }
//     try {
//       setSearching(true);
//       const results = await eventService.searchEvents(searchQuery);
//       setSearchResults(results);
//     } catch (e) {
//       console.error('Error searching events:', e);
//     } finally {
//       setSearching(false);
//     }
//   };

//   if (loading) {
//     // state skeleton saat pertama load
//     return (
//       <div className="min-h-screen app-bg">
//         <main className="relative flex-1 pb-14">
//           <Container>
//             <section className="relative z-[1] overflow-hidden py-8">
//               <header className="mb-4 flex items-center">
//                 <div className="flex-1 pr-4">
//                   <h1 className="mb-1 text-2xl font-bold">Find Amazing Events</h1>
//                   <p className="text-sm text-secondary">Discover the best events happening around you</p>
//                 </div>
//               </header>
//               <form className="mb-6">
//                 <div className="flex gap-2">
//                   <Input placeholder="Search events..." className="flex-1" />
//                   <Button>Search</Button>
//                 </div>
//               </form>
//               <div className="flex gap-4 overflow-x-auto whitespace-nowrap py-2">
//                 {Array.from({ length: 3 }).map((_, i) => (
//                   <div key={i} className="w-[160px] flex-shrink-0">
//                     <LoadingCard />
//                   </div>
//                 ))}
//               </div>
//             </section>

//             <section className="relative z-[1] overflow-hidden py-8">
//               <header className="mb-4 flex items-center">
//                 <div className="flex-1 pr-4">
//                   <h2 className="mb-1 text-xl font-bold">Events by Location</h2>
//                   <p className="text-sm text-secondary">Find events happening near you</p>
//                 </div>
//               </header>
//               <div className="flex gap-4 overflow-x-auto whitespace-nowrap py-2">
//                 {Array.from({ length: 3 }).map((_, i) => (
//                   <div key={i} className="w-[160px] flex-shrink-0">
//                     <LoadingCard />
//                   </div>
//                 ))}
//               </div>
//             </section>
//           </Container>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen app-bg">
//       <main className="relative flex-1 pb-14">
//         <Container>
//           {/* hero + search */}
//           <section className="relative z-[1] overflow-hidden py-8">
//             <header className="mb-4 flex items-center">
//               <div className="flex-1 pr-4">
//                 <h1 className="mb-1 text-2xl font-bold">Find Amazing Events</h1>
//                 <p className="text-sm text-secondary">Discover the best events happening around you</p>
//               </div>
//             </header>

//             <form onSubmit={handleSearch} className="mb-6">
//               <div className="flex gap-2">
//                 <Input
//                   placeholder="Search events..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 <Button type="submit">Search</Button>
//               </div>
//             </form>

//             {/* hasil pencarian */}
//             {searchQuery && (
//               <section className="mb-8">
//                 <h2 className="mb-4 text-xl font-bold">
//                   {searching ? 'Searching...' : `Search Results (${searchResults.length})`}
//                 </h2>

//                 {searching ? (
//                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
//                     {Array.from({ length: 3 }).map((_, i) => (
//                       <LoadingCard key={i} />
//                     ))}
//                   </div>
//                 ) : searchResults.length > 0 ? (
//                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
//                     {searchResults.map((ev) => (
//                       <EventCard key={ev.id} event={ev} />
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="py-8 text-center">
//                     <p className="text-gray-500">No events found matching "{searchQuery}"</p>
//                   </div>
//                 )}
//               </section>
//             )}

//             {/* latest carousel */}
//             {!searchQuery && (
//               <div className="flex gap-4 overflow-x-auto whitespace-nowrap py-2">
//                 {latestEvents.map((ev) => (
//                   <div key={ev.id} className="w-[160px] flex-shrink-0">
//                     <EventCard event={ev} />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </section>

//           {/* group by location */}
//           {!searchQuery && (
//             <section className="relative z-[1] overflow-hidden py-8">
//               <header className="mb-4 flex items-center">
//                 <div className="flex-1 pr-4">
//                   <h2 className="mb-1 text-xl font-bold">Events by Location</h2>
//                   <p className="text-sm text-secondary">Find events happening near you</p>
//                 </div>
//               </header>

//               <div className="flex gap-4 overflow-x-auto whitespace-nowrap py-2">
//                 {Object.entries(eventsByCategory).map(([category, list]) => (
//                   <div key={category} className="w-[160px] flex-shrink-0">
//                     <EventCard event={list[0]} />
//                   </div>
//                 ))}
//               </div>
//             </section>
//           )}
//         </Container>
//       </main>
//     </div>
//   );
// }

import { redirect } from "next/navigation";
export default function Root() { redirect("/events"); }
