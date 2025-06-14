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
  text?: string;
  libelle?: string;
  link?: string;
  uri?: string;
}

const Home = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [page, setPage] = useState('');
  const [type, setType] = useState<'text' | 'button' | 'image'>('text');
  const [text, setText] = useState('');
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');


  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/pages/pages');
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        const data = await res.json();
        const simplifiedPages = data.map((p: any) => ({
          id: p.ID_Page.toString(),
          name: p.Titre_Page,
          slug: p.Slug_Page,
        }));
        setPages(simplifiedPages);
      } catch (err) {
        console.error('Erreur lors du chargement des pages :', err);
        setPages([]);
      }
    };

    fetchPages();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      if (!page) {
        setPreviewItems([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/content/page/${page}`);
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        const data = await res.json();
        setPreviewItems(data);
      } catch (err) {
        console.error('Erreur lors du chargement des contenus :', err);
        setPreviewItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [page]);



   const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPageTitle.trim() || !newPageSlug.trim()) {
      alert('Veuillez remplir les deux champs');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/pages/addPage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Titre_Page: newPageTitle,
          Slug_Page: newPageSlug,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Erreur : ${error.message || res.statusText}`);
        return;
      }

      alert('Page créée avec succès !');
      setNewPageTitle('');
      setNewPageSlug('');

      // Recharger les pages
      const updated = await fetch('http://localhost:3000/api/pages/pages');
      const updatedData = await updated.json();
      const simplified = updatedData.map((p: any) => ({
        id: p.ID_Page.toString(),
        name: p.Titre_Page,
        slug: p.Slug_Page,
      }));
      setPages(simplified);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création de la page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!page) {
      alert('Veuillez sélectionner une page');
      return;
    }

    let contentObj: ParsedContent = {};

    if (type === 'text') {
      if (!text.trim()) return alert('Le texte est requis.');
      contentObj = { text };
    }

    if (type === 'button') {
      if (!buttonLabel.trim() || !buttonLink.trim()) return alert('Libellé et lien requis.');
      contentObj = { libelle: buttonLabel, link: buttonLink };
    }

    if (type === 'image') {
      if (!imageFile) return alert('Veuillez sélectionner une image.');

      try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await fetch('http://localhost:3000/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error(`Erreur upload: ${await uploadRes.text()}`);

        const uploadData = await uploadRes.json();
        if (!uploadData.url) throw new Error('Réponse invalide de l’upload');

        contentObj = { uri: uploadData.url };
      } catch (err) {
        console.error(err);
        alert('Erreur lors de l’upload de l’image.');
        return;
      }
    }

    const payload = {
      page,
      type,
      text: JSON.stringify(contentObj),
    };

    try {
      const res = await fetch('http://localhost:3000/api/content/addElement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Contenu ajouté avec succès !');
        setText('');
        setButtonLabel('');
        setButtonLink('');
        setImageFile(null);
        const updatedContent = await fetch(`http://localhost:3000/api/content/page/${page}`);
        const data = await updatedContent.json();
        setPreviewItems(data);
      } else {
        const err = await res.json();
        alert(`Erreur lors de l'envoi : ${err.error || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau.');
    }
  };

  return (
    <div className="container">
      <Navbar />
      <main className="main">
        <h1 className="title">Bienvenue !</h1>
        <h2>Créer une nouvelle page</h2>
      <form onSubmit={handleCreatePage} style={{ marginBottom: '40px', width: '20vw' }}>
        <div>
          <label>Titre de la page :</label>
          <input
            type="text"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Slug de la page :</label>
          <input
            type="text"
            value={newPageSlug}
            onChange={(e) => setNewPageSlug(e.target.value)}
            required
          />
        </div>
        <button type="submit">Créer la page</button>
      </form>
       <h2>Ajouter des élements</h2>
        <div className="main-container-content" style={{ display: 'flex', gap: '20px' }}>
          {/* Preview zone */}
          <div className="preview-container-content">
            {isLoading ? (
              <p>Chargement...</p>
            ) : previewItems.length === 0 ? (
              <p>Aucun contenu pour cette page.</p>
            ) : (
              <div>
                {previewItems.map((item, index) => {
                  let content: ParsedContent;
                  try {
                    content =
                      typeof item.Content_Element === 'string'
                        ? JSON.parse(item.Content_Element)
                        : item.Content_Element;
                  } catch (err) {
                    console.error('Erreur JSON.parse :', err);
                    return <p key={index}>Contenu invalide</p>;
                  }

                  switch (item.Type_Element) {
                    case 'text':
                      return <p key={index} style={{ margin: 0 }}>{content.text}</p>;
                    case 'button':
                      return (
                        <button
                          key={index}
                          onClick={() => window.open(content.link, '_blank')}
                          style={{ display: 'block', margin: 0 }}
                        >
                          {content.libelle}
                        </button>
                      );
                    case 'image':
                      const imageUrl = content.uri?.startsWith('http')
                        ? content.uri
                        : `http://localhost:3000${content.uri}`;
                      return (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`image-${index}`}
                          style={{ maxWidth: '100%', display: 'block', margin: 0 }}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            )}
          </div>

          {/* Formulaire */}
          <div className="choice-container-content">
            <div className="page-select-container" style={{ marginBottom: '15px' }}>
              <label htmlFor="page-select">Page :</label>
              <select
                id="page-select"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                required
              >
                <option value="">-- Sélectionner une page --</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="choice-select-container" style={{ marginBottom: '15px' }}>
                <label htmlFor="type-select">Type :</label>
                <select
                  id="type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'text' | 'button' | 'image')}
                >
                  <option value="text">Texte</option>
                  <option value="button">Bouton</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <div className="text-content-container" style={{ marginBottom: '15px' }}>
                {type === 'text' && (
                  <>
                    <label htmlFor="text">Contenu :</label>
                    <textarea
                      id="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      required
                    />
                  </>
                )}
                {type === 'button' && (
                  <>
                    <label htmlFor="button-label">Libellé :</label>
                    <input
                      id="button-label"
                      value={buttonLabel}
                      onChange={(e) => setButtonLabel(e.target.value)}
                      required
                    />
                    <label htmlFor="button-link">Lien :</label>
                    <input
                      id="button-link"
                      value={buttonLink}
                      type="url"
                      onChange={(e) => setButtonLink(e.target.value)}
                      required
                    />
                  </>
                )}
                {type === 'image' && (
                  <>
                    <label htmlFor="image-upload">Image :</label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null)
                      }
                      required
                    />
                  </>
                )}
              </div>

              <button type="submit" style={{ width: '100%' }}>
                Ajouter
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
