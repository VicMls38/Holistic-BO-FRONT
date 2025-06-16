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


const OrderEditor = ({
  items,
  setItems,
}: {
  items: ContentItem[];
  setItems: React.Dispatch<React.SetStateAction<ContentItem[]>>;
}) => {
  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const itemId = items[index].ID_Element;
    const url =
      direction === 'up'
        ? 'https://ethan-server.com:8443/api/content/moveUp'
        : 'https://ethan-server.com:8443/api/content/moveDown';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId }),
      });
      if (!res.ok) throw new Error('Erreur lors du déplacement');

      // Mise à jour locale uniquement si la requête réussit
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
      alert(`Impossible de déplacer l'élément : ${(error as Error).message}`);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const res = await fetch('https://ethan-server.com:8443/api/content/deleteElement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      setItems((prev) => prev.filter((item) => item.ID_Element !== id));
    } catch (error) {
      alert(`Impossible de supprimer l'élément : ${(error as Error).message}`);
    }
  };

  return (
    <div
      className="order-editor"
      style={{ border: '1px solid #ccc', padding: 10, width: '20vw', maxHeight: 400, overflowY: 'auto' }}
    >
      <h3>Modifier l'ordre</h3>
      {items.length === 0 && <p>Aucun élément à réordonner</p>}
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {items.map((item, index) => {
          let label = '';
          try {
            const content: ParsedContent =
              typeof item.Content_Element === 'string'
                ? JSON.parse(item.Content_Element)
                : item.Content_Element;
            if (item.Type_Element === 'text') label = content.text || 'Texte';
            else if (item.Type_Element === 'button') label = content.libelle || 'Bouton';
            else if (item.Type_Element === 'image') label = 'Image';
          } catch {
            label = 'Contenu invalide';
          }

          return (
            <li key={item.ID_Element} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>

              <button
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                style={{ marginRight: 5 }}
                aria-label="Déplacer vers le haut"
              >
                ↑
              </button>

              <button
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                aria-label="Déplacer vers le bas"
                style={{ marginRight: 5 }}
              >
                ↓
              </button>

              <button
                type="button"
                onClick={() => deleteItem(item.ID_Element)}
                aria-label="Supprimer l'élément"
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderRadius: 3,
                }}
              >
                Supprimer
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};



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
        const res = await fetch('https://ethan-server.com:8443/api/pages/pages');
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
        const res = await fetch(`https://ethan-server.com:8443/api/content/page/${page}`);
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
        alert(`Erreur : ${error.message || res.statusText}`);
        return;
      }

      alert('Page créée avec succès !');
      setNewPageTitle('');
      setNewPageSlug('');

      // Actualiser la liste des pages
      const updated = await fetch('https://ethan-server.com:8443/api/pages/pages');
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

        const uploadRes = await fetch('https://ethan-server.com:8443/api/upload-image', {
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
      const res = await fetch('https://ethan-server.com:8443/api/content/addElement', {
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
        // Recharger le contenu pour mise à jour
        const updatedContent = await fetch(`https://ethan-server.com:8443/api/content/page/${page}`);
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
    <>
      <Navbar />
      <div className="home-container" style={{ display: 'flex', gap: 20, padding: 20 }}>
        <aside className='aside-pages-editor' style={{ width: '20vw', borderRight: '1px solid #ddd', paddingRight: 10 }}>
          <h2>Pages</h2>
          {pages.length === 0 && <p>Aucune page disponible</p>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {pages.map((p) => (
              <li
                key={p.id}
                onClick={() => setPage(p.id)}
                style={{
                  cursor: 'pointer',
                  fontWeight: p.id === page ? 'bold' : 'normal',
                  padding: '6px 4px',
                  borderRadius: 4,
                  backgroundColor: p.id === page ? '#eef' : undefined,
                }}
                aria-current={p.id === page ? 'page' : undefined}
              >
                {p.name}
              </li>
            ))}
          </ul>

          <form onSubmit={handleCreatePage} style={{ marginTop: 30 }}>
            <h3>Créer une page</h3>
            <input
              type="text"
              placeholder="Titre"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              required
              style={{ display: 'block', marginBottom: 8, width: '100%' }}
            />
            <input
              type="text"
              placeholder="Slug"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              required
              style={{ display: 'block', marginBottom: 8, width: '100%' }}
            />
            <button type="submit" style={{ width: '100%' }}>
              Créer
            </button>
          </form>
        </aside>

        <main style={{ flexGrow: 1 }}>
          <section>
            <h2>Ajouter un élément</h2>
            <form onSubmit={handleSubmit} style={{ maxWidth: 500, marginBottom: 20 }}>
              <label>
                Page :
                <select
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  required
                  style={{ marginLeft: 10 }}
                >
                  <option value="">-- Sélectionner --</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ marginTop: 12 }}>
                <label>
                  Type d'élément :
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'text' | 'button' | 'image')}
                    style={{ marginLeft: 10 }}
                  >
                    <option value="text">Texte</option>
                    <option value="button">Bouton</option>
                    <option value="image">Image</option>
                  </select>
                </label>
              </div>

              {type === 'text' && (
                <div style={{ marginTop: 12 }}>
                  <label>
                    Texte :
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      style={{ display: 'block', width: '100%', marginTop: 4 }}
                      required
                    />
                  </label>
                </div>
              )}

              {type === 'button' && (
                <>
                  <div style={{ marginTop: 12 }}>
                    <label>
                      Libellé du bouton :
                      <input
                        type="text"
                        value={buttonLabel}
                        onChange={(e) => setButtonLabel(e.target.value)}
                        required
                        style={{ display: 'block', width: '100%', marginTop: 4 }}
                      />
                    </label>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label>
                      URL du lien :
                      <input
                        type="url"
                        value={buttonLink}
                        onChange={(e) => setButtonLink(e.target.value)}
                        required
                        style={{ display: 'block', width: '100%', marginTop: 4 }}
                      />
                    </label>
                  </div>
                </>
              )}

              {type === 'image' && (
                <div style={{ marginTop: 12 }}>
                  <label>
                    Sélectionner une image :
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                      required
                      style={{ display: 'block', marginTop: 4 }}
                    />
                  </label>
                </div>
              )}

              <button type="submit" style={{ marginTop: 20 }}>
                Ajouter
              </button>
            </form>
          </section>

           <section>
      <h2>Prévisualisation</h2>
      {isLoading && <p>Chargement...</p>}
      <div style={{ border: '1px solid #ddd', padding: 10, minHeight: 100 }}>
        {!isLoading && previewItems.length === 0 && <p>Aucun élément à afficher.</p>}
        {previewItems.map((item) => {
          let content: ParsedContent = {};

          try {
            content = typeof item.Content_Element === 'string' ? JSON.parse(item.Content_Element) : item.Content_Element;
          } catch (e) {
            return (
              <p key={item.ID_Element} style={{ color: 'red' }}>
                Erreur de contenu
              </p>
            );
          }

          switch (item.Type_Element) {
            case 'text':
              return <p key={item.ID_Element}>{content.text}</p>;

            case 'button':
              return (
                <a
                  key={item.ID_Element}
                  href={content.link ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    margin: '6px 0',
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    borderRadius: 4,
                    textDecoration: 'none',
                  }}
                >
                  {content.libelle}
                </a>
              );

            case 'image':
              return (
                <img
                  key={item.ID_Element}
                  src={content.uri}
                  alt="Image preview"
                  style={{ maxWidth: '100%', height: 'auto', marginTop: 10 }}
                />
              );

            default:
              return null;
          }
        })}
      </div>
    </section>

        </main>

        <OrderEditor items={previewItems} setItems={setPreviewItems} />
      </div>
    </>
  );
};

export default Home;
