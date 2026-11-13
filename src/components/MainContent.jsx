import { useState, useEffect } from 'react';

function MainContent() {
  const [isLargeText, setIsLargeText] = useState(false);

  const [items, setItems] = useState([]);
  const [serverStatus, setServerStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    async function fetchBackendData() {
      try {
        setLoading(true);
        setError(null);

        const [statusRes, itemsRes] = await Promise.all([
          fetch('http://localhost:5000/api/status'),
          fetch('http://localhost:5000/api/items')
        ]);

        if (!statusRes.ok || !itemsRes.ok) {
          throw new Error('Failed to load data from server');
        }

        const statusData = await statusRes.json();
        const itemsData = await itemsRes.json();

        setServerStatus(statusData.status);
        setItems(itemsData);
      } catch (err) {
        setError('Error: Cannot connect to Backend. Make sure server.js is running on port 5000.');
      } finally {
        setLoading(false);
      }
    }

    fetchBackendData();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, category, description })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item');
      }

      setItems((prev) => [...prev, data]);
      setTitle('');
      setCategory('');
      setDescription('');
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <main className={isLargeText ? "large-text-mode" : ""}>
      <section className="page-hero">
        <button
          onClick={() => setIsLargeText(!isLargeText)}
          className="button"
          style={{ marginBottom: '20px' }}
        >
          {isLargeText ? "Обычный шрифт" : "Увеличить шрифт"}
        </button>

        <p className="section-label">LEARNING FOR EVERYONE</p>
        <h1>Accessible Learning</h1>
        <p>
          Learning becomes more manageable when information is clearly
          organized and presented in different ways. Small changes can help
          students understand and use educational materials more effectively.
        </p>
      </section>

      <section className="content-section">
        <h2>What Is Accessible Learning?</h2>
        <p>
          Accessible learning means presenting educational information in ways that different students can use. It considers how people read, understand, interact with, and respond to learning materials.
        </p>
        <p>
          Some students benefit from shorter explanations, while others may find diagrams, audio or practical examples helpful. Offering different formats can make learning more flexible.
        </p>
        <p>
          The goal is not to make learning less meaningful. It is to reduce unnecessary barriers so students can focus on understanding the subject.
        </p>
      </section>

      <section className="content-section">
        <h2>
          Learning Resources {serverStatus && `(Server: ${serverStatus})`}
        </h2>

        {loading && <p>Loading resources from server...</p>}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '12px'
                }}
              >
                <h3>{item.title}</h3>
                <p><strong>Category:</strong> {item.category}</p>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        )}

        <h3>Add New Resource</h3>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}

        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Category (e.g. Reading Tools)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: '8px' }}
          />
          <button type="submit" className="button">
            Add Resource
          </button>
        </form>
      </section>
    </main>
  );
}

export default MainContent;