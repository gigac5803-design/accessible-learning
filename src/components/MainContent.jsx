import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

function MainContent() {
  const [isLargeText, setIsLargeText] = useState(false);

  // Part 1: Состояния для списка учебных материалов (CRUD)
  const [items, setItems] = useState([]);
  const [serverStatus, setServerStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Форма добавления нового материала (POST)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState(null);

  // Состояния для редактирования карточки (PATCH)
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState(null);

  // Part 2: Состояния для внешнего словаря (Free Dictionary API)
  const [searchWord, setSearchWord] = useState('dyslexia');
  const [dictResult, setDictResult] = useState(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictError, setDictError] = useState(null);

  // Part 3: Состояния для AI-упрощения текста внутри карточек
  const [aiResults, setAiResults] = useState({});
  const [aiLoadingId, setAiLoadingId] = useState(null);
  const [aiErrors, setAiErrors] = useState({});

  useEffect(() => {
    async function fetchBackendData() {
      try {
        setLoading(true);
        setError(null);

        const [statusRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/status`),
          fetch(`${API_URL}/items`)
        ]);

        if (!statusRes.ok || !itemsRes.ok) {
          throw new Error('Failed to load data from server');
        }

        const statusData = await statusRes.json();
        const itemsData = await itemsRes.json();

        setServerStatus(statusData.status);
        setItems(itemsData);
      } catch {
        setError('Error: Cannot connect to Backend. Make sure server.js is running on port 5000.');
      } finally {
        setLoading(false);
      }
    }

    fetchBackendData();
  }, []);

  // POST: Добавление нового материала
  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Начать редактирование карточки
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditDescription(item.description);
    setEditError(null);
  };

  // PATCH: Сохранить изменения карточки
  const handleUpdateItem = async (id) => {
    setEditError(null);

    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          description: editDescription
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item');
      }

      setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
      setEditingId(null);
    } catch (err) {
      setEditError(err.message);
    }
  };

  // DELETE: Удалить карточку
  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete item');
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Part 2: Запрос ко внешнему Dictionary API через наш бэкенд
  const handleDictionarySearch = async (e) => {
    e.preventDefault();
    const cleanWord = searchWord.trim();
    if (!cleanWord) {
      setDictError('Please enter an English word.');
      return;
    }

    try {
      setDictLoading(true);
      setDictError(null);
      setDictResult(null);

      const response = await fetch(`${API_URL}/dictionary/${encodeURIComponent(cleanWord)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Word not found');
      }

      setDictResult(data);
    } catch (err) {
      setDictError(err.message);
    } finally {
      setDictLoading(false);
    }
  };

  // Part 3: AI-упрощение описания конкретной карточки
  const handleSimplifyWithAI = async (item) => {
    try {
      setAiLoadingId(item.id);
      setAiErrors((prev) => ({ ...prev, [item.id]: null }));

      const response = await fetch(`${API_URL}/ai/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          description: item.description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI simplification failed');
      }

      setAiResults((prev) => ({ ...prev, [item.id]: data.simplifiedText }));
    } catch (err) {
      setAiErrors((prev) => ({ ...prev, [item.id]: err.message }));
    } finally {
      setAiLoadingId(null);
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
      </section>

      {/* PART 2: Внешний публичный API (Словарь и произношение) */}
      <section className="content-section">
        <h2>Word Helper (Dictionary API)</h2>
        <p>Look up difficult English words to see a clear definition and listen to pronunciation.</p>

        <form onSubmit={handleDictionarySearch} style={{ display: 'flex', gap: '10px', maxWidth: '450px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Enter an English word (e.g. reading)"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
          <button type="submit" className="button" disabled={dictLoading}>
            {dictLoading ? 'Searching...' : 'Look Up'}
          </button>
        </form>

        {/* Состояние Loading */}
        {dictLoading && <p>Loading word definition from Dictionary API...</p>}

        {/* Состояние Error */}
        {dictError && <p style={{ color: 'red' }}>Error: {dictError}</p>}

        {/* Состояние Success */}
        {dictResult && (
          <div style={{ border: '1px solid #4a90e2', borderRadius: '8px', padding: '15px', backgroundColor: '#f8fbff', marginBottom: '15px' }}>
            <h3 style={{ marginTop: 0 }}>
              {dictResult.word} {dictResult.phonetic && <span>({dictResult.phonetic})</span>}
            </h3>
            {dictResult.partOfSpeech && <p><strong>Part of speech:</strong> {dictResult.partOfSpeech}</p>}
            <p><strong>Definition:</strong> {dictResult.definition}</p>
            {dictResult.example && <p><strong>Example:</strong> "{dictResult.example}"</p>}
            {dictResult.audioUrl && (
              <audio controls src={dictResult.audioUrl} style={{ marginTop: '8px' }}>
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        )}
      </section>

      {/* PART 1 & PART 3: Учебные материалы (CRUD + AI Simplify) */}
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
                  marginBottom: '14px'
                }}
              >
                {editingId === item.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '450px' }}>
                    {editError && <p style={{ color: 'red', margin: 0 }}>{editError}</p>}
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ padding: '8px' }}
                    />
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      style={{ padding: '8px' }}
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{ padding: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="button" onClick={() => handleUpdateItem(item.id)}>
                        Save
                      </button>
                      <button type="button" className="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{item.title}</h3>
                    <p><strong>Category:</strong> {item.category}</p>
                    <p>{item.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        className="button"
                        onClick={() => handleSimplifyWithAI(item)}
                        disabled={aiLoadingId === item.id}
                      >
                        {aiLoadingId === item.id ? 'AI Simplifying...' : 'Simplify Text (AI)'}
                      </button>

                      <button type="button" className="button" onClick={() => startEditing(item)}>
                        Edit
                      </button>

                      <button type="button" className="button" onClick={() => handleDeleteItem(item.id)}>
                        Delete
                      </button>
                    </div>

                    {/* Ошибка или результат AI-упрощения */}
                    {aiErrors[item.id] && (
                      <p style={{ color: 'red', marginTop: '10px' }}>AI Error: {aiErrors[item.id]}</p>
                    )}

                    {aiResults[item.id] && (
                      <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '4px' }}>
                        <strong>AI Easy-Read Version:</strong>
                        <p style={{ margin: '5px 0 0 0' }}>{aiResults[item.id]}</p>
                      </div>
                    )}
                  </>
                )}
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