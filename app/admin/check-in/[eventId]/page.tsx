'use client';

import { useState, useEffect, useRef } from 'react';
import { events, ticketTransactions, eventTickets } from '@//lib/dummy-data';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';
import Container from '@//components/ui/Container';
import Card from '@//components/ui/Card';
import Button from '@//components/ui/Button';

// Use the correct Next.js type for page parameters
export default function AdminCheckInPage({ params }: { params: { eventId: string } }) {
  // Find the event
  const event = events.find((e: any) => e.id === parseInt(params.eventId));
  
  // If event not found, redirect to events page
  if (!event) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/events';
    }
    return null;
  }

  // Check if admin is logged in
  if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
    window.location.href = '/admin/login';
    return null;
  }

  const [scannedTicket, setScannedTicket] = useState<any>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannerElementRef.current && isScanning) {
      // Initialize the QR scanner
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scannerRef.current = scanner;
      
      scanner.render(
        (decodedText: string) => {
          // Success callback
          setScanResult(decodedText);
          handleScanResult(decodedText);
        },
        (errorMessage: string) => {
          // Error callback
          console.log('QR scan error:', errorMessage);
        }
      );
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error('Failed to clear scanner:', error);
        });
      }
    };
  }, [isScanning]);

  const handleScanResult = (uuid: string) => {
    // Find the ticket transaction by UUID
    const transaction = ticketTransactions.find((t: any) => t.id === uuid);
    
    if (transaction) {
      // Find the ticket type
      const ticket = eventTickets.find((t: any) => t.id === transaction.event_ticket_id);
      
      setScannedTicket({
        transaction,
        ticket
      });
    } else {
      setScannedTicket({
        error: 'Ticket not found'
      });
    }
    
    // Stop scanning
    setIsScanning(false);
    
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error('Failed to clear scanner:', error);
      });
    }
  };

  const confirmCheckIn = () => {
    if (scannedTicket && scannedTicket.transaction) {
      // In a real app, this would update the ticket status in the database
      alert(`Ticket for ${scannedTicket.transaction.ticket_holder_name} has been checked in successfully!`);
      
      // Reset for next scan
      setScannedTicket(null);
      setScanResult(null);
      setIsScanning(true);
    }
  };

  const resetScanner = () => {
    setScannedTicket(null);
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="mb-6">
          <Link href="/admin/events" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Events
          </Link>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Check-in for {event.title}</h1>
            <p className="text-gray-600">Scan QR codes to check in attendees</p>
          </div>

          {scanResult && (
            <Card className="mb-6 p-4 bg-blue-50">
              <p className="text-blue-700">Scanned: {scanResult}</p>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Scanner */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">QR Scanner</h2>
              <div 
                id="qr-reader" 
                ref={scannerElementRef}
                className="w-full h-64 md:h-80 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
              >
                {!isScanning && (
                  <p className="text-gray-500">Scanner paused. Click "Scan Again" to resume.</p>
                )}
              </div>
              
              {scannedTicket && !scannedTicket.error && (
                <div className="mt-6">
                  <Button
                    onClick={resetScanner}
                    variant="primary"
                    className="w-full"
                  >
                    Scan Again
                  </Button>
                </div>
              )}
            </Card>

            {/* Ticket Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Ticket Information</h2>
              
              {scannedTicket ? (
                scannedTicket.error ? (
                  <Card className="p-6 bg-red-50 border border-red-200">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-bold text-red-700">Invalid Ticket</h3>
                    </div>
                    <p className="text-red-600 mb-4">{scannedTicket.error}</p>
                    <Button
                      onClick={resetScanner}
                      variant="danger"
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-6 bg-green-50 border border-green-200">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-bold text-green-700">Valid Ticket</h3>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <p className="text-gray-600">Ticket Holder</p>
                        <p className="font-bold">{scannedTicket.transaction.ticket_holder_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-bold">{scannedTicket.transaction.ticket_holder_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-bold">{scannedTicket.transaction.ticket_holder_phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ticket Type</p>
                        <p className="font-bold">{scannedTicket.ticket?.title || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          scannedTicket.transaction.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          scannedTicket.transaction.status === 'used' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {scannedTicket.transaction.status.charAt(0).toUpperCase() + scannedTicket.transaction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {scannedTicket.transaction.status === 'used' ? (
                      <Card className="p-4 bg-yellow-50 border border-yellow-200">
                        <p className="text-yellow-700 font-bold">This ticket has already been used for check-in.</p>
                      </Card>
                    ) : (
                      <Button
                        onClick={confirmCheckIn}
                        variant="primary"
                        className="w-full"
                      >
                        Confirm Check-in
                      </Button>
                    )}
                  </Card>
                )
              ) : (
                <Card className="p-6 bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-gray-600 text-center">Scan a QR code to view ticket information</p>
                </Card>
              )}
            </Card>
          </div>
        </Card>
      </Container>
    </div>
  );
}