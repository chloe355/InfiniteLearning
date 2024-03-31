import React, { useState } from 'react';
import { getChatGPTResponse } from './ChatGPTService';

function App() {
  const [topic, setTopic] = useState('');
  const [points, setPoints] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await getChatGPTResponse(topic);
    const bulletPoints = response
      // Use a regex to split by numbers followed by a dot and space, assuming enumeration like "1. ", "2. ", etc.
      .split(/(?=\d+\. )/)
      .filter(sentence => sentence.trim() !== '')
      .map((sentence, index) => ({
        content: sentence.endsWith('.') ? sentence : `${sentence}.`, // Ensures each point ends with a period
        detailRequested: false,
        index
      }));

    setPoints(bulletPoints);
  };

  const handleDetailRequest = async (index) => {
    const point = points[index];
    // Fetch more details from the ChatGPT API using the text of the point
    const detailedResponse = await getChatGPTResponse(point.content);
    setPoints(points.map((p, i) => {
      if (i === index) {
        return { ...p, content: `${p.content} - Details: ${detailedResponse}`, detailRequested: true };
      }
      return p;
    }));
  };

  return (
    <div className="App">
      <h1>Explore Educational Topics</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic or question"
        />
        <button type="submit">Get Explanation</button>
      </form>
      {points.length > 0 && <h2>Key Points:</h2>}
      <ul>
        {points.map((point, index) => (
          <li key={index}>
            {point.content}
            {!point.detailRequested && (
              <button onClick={() => handleDetailRequest(index)} style={{marginLeft: '10px'}}>Ask for Details</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
