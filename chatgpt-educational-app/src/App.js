import React, { useState } from 'react';
import { getChatGPTResponse } from './ChatGPTService';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  const [points, setPoints] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await getChatGPTResponse(topic);
    const cleanedResponse = response.replace(/### /g, ' ');
    const bulletPoints = cleanedResponse.split(/(?=\d+\. )/)
      .filter(sentence => sentence.trim() !== '')
      .map((sentence, index) => ({
        content: sentence.endsWith('.') ? sentence : `${sentence}.`,
        detailRequested: false,
        details: [],
        index
      }));

    setPoints(bulletPoints);
  };

  const handleDetailRequest = async (pointIndex, detailIndex = null) => {
    let content;
    if (detailIndex !== null) {
      content = points[pointIndex].details[detailIndex].content;
    } else {
      content = points[pointIndex].content;
    }
    const detailedResponse = await getChatGPTResponse(content);
    const detailsArray = detailedResponse.split(/(?=\d+\. )/)
        .filter(detail => detail.trim() !== '')
        .map(detail => ({
          content: `${detail}.`,
          furtherDetails: []
        }));
    
    setPoints(points.map((point, i) => {
      if (i === pointIndex) {
        const updatedPoint = { ...point, detailRequested: true };
        if (detailIndex !== null) {
          // Append further details for a sub-detail
          updatedPoint.details[detailIndex].furtherDetails = detailsArray;
        } else {
          // Update the details array for a main point detail request
          updatedPoint.details = detailsArray;
        }
        return updatedPoint;
      }
      return point;
    }));
  };

  return (
    <div className="App">
      <h1 className="title">Explore Educational Topics</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic or question"
        />
        <button type="submit">Get Explanation</button>
      </form>
      {points.length > 0 && <div><h2>Key Points:</h2>
        {points.map((point, pointIndex) => (
          <div key={pointIndex} style={{ marginLeft: '20px' }}>
            <p>{point.content}</p>
            {!point.detailRequested && (
              <button onClick={() => handleDetailRequest(pointIndex)} style={{ marginLeft: '20px' }}>
                Ask for Details
              </button>
            )}
            {point.details.length > 0 && point.details.map((detail, detailIndex) => (
              <div key={detailIndex} style={{ marginLeft: '40px' }}>
                <p>{detail.content}</p>
                {/* Show button to ask for further details */}
                <button onClick={() => handleDetailRequest(pointIndex, detailIndex)} style={{ marginLeft: '20px' }}>
                  Ask for More Details
                </button>
                {detail.furtherDetails.length > 0 && detail.furtherDetails.map((furtherDetail, furtherIndex) => (
                  <p key={furtherIndex} style={{ marginLeft: '60px', marginTop: '10px' }}>{furtherDetail.content}</p>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>}
    </div>
  );
}

export default App;
