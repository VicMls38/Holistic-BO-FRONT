import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import '../css/home.css';

interface Page {
  id: string;
  name: string;
  slug: string;
}

interface ContentItem {
  ID_Element: number;
  ID_Page: number;
  Type_Element: 'text' | 'button' | 'image';
  Content_Element: string;
}

interface ParsedContent {
  title?: string;
  text?: string;
  libelle?: string;
  link?: string;
  uri?: string;
}

const OrderEditor = ({
  items,
  setItems,
}: {
  items: ContentItem[];
  setItems: React.Dispatch<React.SetStateAction<ContentItem[]>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const itemId = items[index].ID_Element;
    const url =
      direction === 'up'
        ? 'https://ethan-server.com:8443/api/content/moveUp'
        : 'https://ethan-server.com:8443/api/content/moveDown';

    setIsLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId }),
      });

      if (!res.ok) throw new Error('Error moving item');

      // Update local state only if request succeeds
      setItems((prev) => {
        const newItems = [...prev];
        if (direction === 'up' && index > 0) {
          [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        } else if (direction === 'down' && index < newItems.length - 1) {
          [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
        }
        return newItems;
      });
    } catch (error) {
      alert(`Unable to move item: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('https://ethan-server.com:8443/api/content/deleteElement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error('Error deleting item');
      }

      setItems((prev) => prev.filter((item) => item.ID_Element !== id));
    } catch (error) {
      alert(`Unable to delete item: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemLabel = (item: ContentItem): string => {
    try {
      const content: ParsedContent =
        typeof item.Content_Element === 'string'
          ? JSON.parse(item.Content_Element)
          : item.Content_Element;

      if (item.Type_Element === 'text') return content.text?.substring(0, 30) || 'Text';
      if (item.Type_Element === 'button') return content.libelle || 'Button';
      if (item.Type_Element === 'image') return 'Image';

      return 'Unknown content';
    } catch {
      return 'Invalid content';
    }
  };

  return (
    <div className="order-editor">
      <h3>Manage Order</h3>
      {isLoading && <div className="loading-spinner">Processing...</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No items to reorder</p>
        </div>
      ) : (
        <ul className="items-list">
          {items.map((item, index) => (
            <li key={item.ID_Element} className="item-row">
              <span className="item-label" title={getItemLabel(item)}>
                {getItemLabel(item)}
              </span>

              <div className="item-actions">
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0 || isLoading}
                  className="move-btn"
                  aria-label="Move up"
                  title="Move up"
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1 || isLoading}
                  className="move-btn"
                  aria-label="Move down"
                  title="Move down"
                >
                  ↓
                </button>

                <button
                  type="button"
                  onClick={() => deleteItem(item.ID_Element)}
                  disabled={isLoading}
                  className="delete-btn"
                  aria-label="Delete item"
                  title="Delete item"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Home = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [contentType, setContentType] = useState<'text' | 'button' | 'image'>('text');
  const [titleContent, setTitleContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch pages on component mount
  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('https://ethan-server.com:8443/api/pages/pages');
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json();
        const simplifiedPages = data.map((p: any) => ({
          id: p.ID_Page.toString(),
          name: p.Titre_Page,
          slug: p.Slug_Page,
        }));

        setPages(simplifiedPages);
      } catch (err) {
        console.error('Error loading pages:', err);
        setError('Failed to load pages');
        setPages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, []);

  // Fetch content when page selection changes
  useEffect(() => {
    const fetchContent = async () => {
      if (!selectedPage) {
        setPreviewItems([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://ethan-server.com:8443/api/content/page/${selectedPage}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json();
        setPreviewItems(data);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load content');
        setPreviewItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [selectedPage]);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPageTitle.trim() || !newPageSlug.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('https://ethan-server.com:8443/api/pages/addPage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Titre_Page: newPageTitle,
          Slug_Page: newPageSlug,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || res.statusText);
      }

      setNewPageTitle('');
      setNewPageSlug('');

      // Refresh pages list
      const updated = await fetch('https://ethan-server.com:8443/api/pages/pages');
      const updatedData = await updated.json();
      const simplified = updatedData.map((p: any) => ({
        id: p.ID_Page.toString(),
        name: p.Titre_Page,
        slug: p.Slug_Page,
      }));
      setPages(simplified);

      alert('Page created successfully!');
    } catch (err) {
      console.error(err);
      setError(`Error creating page: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPage) {
      setError('Please select a page');
      return;
    }

    let contentObj: ParsedContent = {};

    if (contentType === 'text') {
      if (!titleContent.trim()) {
        setError('Title is required');
        return;
      }

      if (!textContent.trim()) {
        setError('Text content is required');
        return;
      }
      contentObj = { title: titleContent, text: textContent };
    }

    if (contentType === 'button') {
      if (!buttonLabel.trim() || !buttonLink.trim()) {
        setError('Button label and link are required');
        return;
      }
      contentObj = { libelle: buttonLabel, link: buttonLink, title: titleContent ?? '' };
    }

    if (contentType === 'image') {
      if (!imageFile) {
        setError('Please select an image');
        return;
      }

      setIsSubmitting(true);

      try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await fetch('https://ethan-server.com:8443/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error(`Upload error: ${await uploadRes.text()}`);

        const uploadData = await uploadRes.json();
        if (!uploadData.url) throw new Error('Invalid upload response');

        contentObj = { uri: uploadData.url };
      } catch (err) {
        console.error(err);
        setError('Error uploading image');
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      page: selectedPage,
      type: contentType,
      text: JSON.stringify(contentObj),
    };

    try {
      const res = await fetch('https://ethan-server.com:8443/api/content/addElement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Reset form
        setTextContent('');
        setButtonLabel('');
        setButtonLink('');
        setImageFile(null);

        // Reload content
        const updatedContent = await fetch(`https://ethan-server.com:8443/api/content/page/${selectedPage}`);
        const data = await updatedContent.json();
        setPreviewItems(data);

        alert('Content added successfully!');
      } else {
        const err = await res.json();
        throw new Error(err.error || res.statusText);
      }
    } catch (err) {
      console.error(err);
      setError(`Error adding content: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContentPreview = (item: ContentItem) => {
    let content: ParsedContent = {};

    try {
      content = typeof item.Content_Element === 'string'
        ? JSON.parse(item.Content_Element)
        : item.Content_Element;
    } catch (e) {
      return (
        <div key={item.ID_Element} className="error-content">
          Content error
        </div>
      );
    }

    switch (item.Type_Element) {
      case 'text':
        return (
          <div key={item.ID_Element} className="preview-text">
            <h3>{content.title}</h3>
            {content.text}
          </div>
        );

      case 'button':
        return (
          <>
            <h3>{content.title}</h3>
            <a
              key={item.ID_Element}
              href={content.link ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="preview-button"
            >
              {content.libelle}
            </a>
          </>
        );

      case 'image':
        return (
          <img
            key={item.ID_Element}
            src={"https://ethan-server.com:8443" + content.uri}
            alt="Content preview"
            className="preview-image"
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)} className="error-dismiss">×</button>
          </div>
        )}

        <aside className="sidebar">
          <div className="pages-section">
            <h2>Pages</h2>
            {isLoading ? (
              <div className="loading">Loading pages...</div>
            ) : pages.length === 0 ? (
              <div className="empty-state">No pages available</div>
            ) : (
              <ul className="pages-list">
                {pages.map((page) => (
                  <li
                    key={page.id}
                    onClick={() => setSelectedPage(page.id)}
                    className={`page-item ${page.id === selectedPage ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedPage(page.id);
                      }
                    }}
                  >
                    <span className="page-name">{page.name}</span>
                    <span className="page-slug">/{page.slug}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleCreatePage} className="create-page-form">
            <h3>Create New Page</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Page title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="URL slug"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Creating...' : 'Create Page'}
            </button>
          </form>
        </aside>

        <main className="main-content">
          <section className="add-content-section">
            <h2>Add Content Element</h2>
            <form onSubmit={handleSubmit} className="content-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="page-select">Select Page:</label>
                  <select
                    id="page-select"
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">-- Choose a page --</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="content-type">Content Type:</label>
                  <select
                    id="content-type"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as 'text' | 'button' | 'image')}
                    disabled={isSubmitting}
                  >
                    <option value="text">Text</option>
                    <option value="button">Button</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              </div>

              {contentType === 'text' && (
                <>
                  <div className="form-group">
                    <label htmlFor="title-content">Title:</label>
                    <input
                      id="title-content"
                      value={titleContent}
                      onChange={(e) => setTitleContent(e.target.value)}
                      placeholder="Enter your title..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="text-content">Text Content:</label>
                    <textarea
                      id="text-content"
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      rows={4}
                      placeholder="Enter your text content..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {contentType === 'button' && (
                <>
                <div className="form-group">
                    <label htmlFor="title-content">Title:</label>
                    <input
                      id="title-content"
                      value={titleContent}
                      onChange={(e) => setTitleContent(e.target.value)}
                      placeholder="Enter your title..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="button-label">Button Label:</label>
                    <input
                      id="button-label"
                      type="text"
                      value={buttonLabel}
                      onChange={(e) => setButtonLabel(e.target.value)}
                      placeholder="Enter button text..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="button-link">Button URL:</label>
                    <input
                      id="button-link"
                      type="text"
                      value={buttonLink}
                      onChange={(e) => setButtonLink(e.target.value)}
                      placeholder="https://example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {contentType === 'image' && (
                <div className="form-group">
                  <label htmlFor="image-upload">Select Image:</label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    required
                    disabled={isSubmitting}
                  />
                  {imageFile && (
                    <div className="file-info">
                      Selected: {imageFile.name}
                    </div>
                  )}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? 'Adding...' : 'Add Content'}
              </button>
            </form>
          </section>

          <section className="preview-section">
            <h2>Content Preview</h2>
            <div className="preview-container">
              {isLoading ? (
                <div className="loading">Loading content...</div>
              ) : previewItems.length === 0 ? (
                <div className="empty-state">No content to display</div>
              ) : (
                <div className="preview-items">
                  {previewItems.map(renderContentPreview)}
                </div>
              )}
            </div>
          </section>
        </main>

        <OrderEditor items={previewItems} setItems={setPreviewItems} />
      </div>
    </>
  );
};

export default Home;