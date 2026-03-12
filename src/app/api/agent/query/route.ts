import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query;

    let reply = `I've received your query: '${query}'. My multi-agent system is analyzing the requirements for your business in Beşiktaş.`;
    
    // Some basic mock logic for the quick questions
    if (query.toLowerCase().includes('what permits do i need')) {
      reply = 'Based on your location in Beşiktaş, typically a restaurant requires:\n\n1. İşyeri Açma ve Çalışma Ruhsatı (Workplace Opening License)\n2. Yangın Uygunluk Belgesi (Fire Safety Certificate)\n3. Gıda Satış Ruhsatı (Food Sales License)\n\nI can help you gather the documents for these.';
    } else if (query.toLowerCase().includes('how long does the fire safety')) {
      reply = 'The fire safety inspection (İtfaiye Uygunluk) generally takes 2 to 4 weeks depending on the municipality backlog. Ensure your kitchen exhaust schematic is uploaded beforehand to prevent delays.';
    } else if (query.toLowerCase().includes('what is i̇şyeri açma')) {
      reply = 'İşyeri Açma ve Çalışma Ruhsatı is the fundamental municipal license required to legally open and operate a business premise in Turkey. It proves your venue meets local zoning, safety, and health standards.';
    } else if (query.toLowerCase().includes('what documents does beşiktaş')) {
      reply = "Beşiktaş Municipality requires:\n• Tapu (Title Deed) or Lease Agreement\n• Tax Registration Certificate (Vergi Levhası)\n• ID Copy / Signature Circular\n• Chamber of Commerce Registration\n• Fire Safety Certificate (if applicable)\n• Building Occupancy Permit (İskan)";
    } else if (query.toLowerCase().includes('what is the cost of a fire safety')) {
      reply = "The official municipal fee for a fire safety inspection in Istanbul varies based on the square footage (m²) of your venue. For a standard 100m² restaurant, expect around 2,500 - 4,000 TRY for 2024 tariffs.";
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      role: 'assistant',
      content: reply
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}
