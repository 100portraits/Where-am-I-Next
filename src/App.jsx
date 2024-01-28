import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ical from 'ical';

export default function App() {
  const [calendarData, setCalendarData] = useState(null);
  const [icalLink, setIcalLink] = useState('');
  const [submittedLink, setSubmittedLink] = useState(localStorage.getItem('icalLink'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [studentNumber, setStudentNumber] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!submittedLink) {
        return;
      }
      const response = await axios.get(submittedLink);
      response.data = response.data.replace(/\\n/g, '');
      //find line startting with  X-WR-CALNAME:
      const calName = response.data.match(/X-WR-CALNAME:(.*)/)[1];
      setStudentNumber(calName.split(": ")[1].split("@")[0]);
      const data = ical.parseICS(response.data);
      setCalendarData(data);
    };

    fetchData();
  }, [submittedLink]);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('icalLink', icalLink);
    setSubmittedLink(icalLink);
  };

  const handleReset = () => {
    localStorage.removeItem('icalLink');
    setSubmittedLink(null);
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const fetchData = async () => {
      const response = await axios.get(submittedLink);
      const data = ical.parseICS(response.data);
      setCalendarData(data);
    };
    await fetchData();
    setIsRefreshing(false);
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${time}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${time}`;
    } else {
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      return `${day} at ${time}`;
    }
  };

  const upcomingEvents = Object.values(calendarData || {})
    .filter((event) => event.type === 'VEVENT')
    .filter((event) => event.start > new Date())
    .sort((a, b) => a.start - b.start)
    .slice(0, 3)
    .map((event) => ({
      uid: event.uid,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: new Date(event.start),
    }));

    if (!submittedLink) {
      return (
        <div className='flex min-h-screen min-w-screen justify-center'>
          <div className='flex flex-col max-w-3xl bg-slate-200 lg:my-10 p-10'>
          <p>Made by <a href='https://sahir.nl' className='underline hover:no-underline'>Sahir</a></p>
            <h1 className='text-5xl md:text-7xl font-bold mb-5'>Where am I next?</h1>
            <form onSubmit={handleSubmit} className='flex flex-col'>
              <label htmlFor='ical-link' className='text-2xl md:text-3xl '>
                rooster.uva.nl, <br></br>
              </label>
                <span className='text-md'>Connect Calendar -> Other -> copy the URL </span>
              <input 
                id='ical-link'
                type='text'
                className='p-2 mt-5'
                onChange={(e) => setIcalLink(e.target.value)}
              />
              <button type='submit' className='bg-slate-500 text-white p-2 mt-3'>
                Go
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className='flex min-h-screen min-w-screen justify-center'>
        <div className='flex flex-col justify-between max-w-3xl bg-slate-200 lg:my-10 p-10'>
          <div>
          <p>Made by <a href='https://sahir.nl' className='underline hover:no-underline'>Sahir</a></p>

          <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold '>Where am I next?</h1>
          {studentNumber && <p className='text-md md:text-lg mb-6'>Student Number: {studentNumber}</p>}

          <div className='flex flex-col mt-5 gap-5'>
            {upcomingEvents.map((event, index) => (
              <div key={event.uid} className={`flex flex-col `}>
                <div className='flex flex-col'>
                  {event.location ? (
                    <span className={` font-bold ${index !== 0 ? 'text-lg lg:text-2xl' : 'text-3xl md:text-5xl'}`}>{event.location}</span>
                  ) : 
                  <span className={` font-bold ${index !== 0 ? 'text-lg lg:text-2xl' : 'text-3xl md:text-5xl'}`}>No location available</span>
                  }
                  <span className={`font-semibold ${index !== 0 ? 'lg:text-lg' : 'text-xl md:text-2xl'}`}>{formatDate(event.start)}</span>
                  <span className={` ${index !== 0 ? 'text-md' : 'text-lg'}`}>{event.summary}</span>
                  
                </div>
              </div>
            ))}
          </div>
          </div>
          <div className='flex flex-col justify-between w-full'>
            <button
              type='button'
              className={`${isRefreshing? 'bg-slate-600' : 'bg-slate-500'} text-white p-2 mt-5 w-full`}
              onClick={handleRefresh}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}

            </button>
            <button
              type='button'
              className='bg-red-600 text-white p-2  mt-5 w-full'
              onClick={handleReset}
            >
              Change iCal link
            </button>
            

        </div>
        </div>
      </div>
    )
}