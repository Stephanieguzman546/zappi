'use client';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
    const [raw, setRaw] = useState('');
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [recent, setRecent] = useState([]);

    // --- utils: recent storage ---
    const saveRecent = (list) => {
        setRecent(list);
        try { localStorage.setItem('zappi_recent', JSON.stringify(list)); } catch { }
    };
    const addRecent = (d) => {
        const next = [d, ...recent.filter((x) => x !== d)].slice(0, 7); // до 7 номеров
        saveRecent(next);
    };
    const removeRecent = (d) => {
        saveRecent(recent.filter((x) => x !== d));
    };
    const clearRecent = () => saveRecent([]);

    // --- normalize & validate ---
    const normalize = (v) => {
        if (!v) return '';
        let d = String(v).replace(/\D+/g, '');
        if (d.startsWith('00')) d = d.slice(2);          // 00 → intl
        if (d.length === 11 && d.startsWith('8')) d = '7' + d.slice(1); // RU/KZ 8→7
        while (d.startsWith('0')) d = d.slice(1);        // удалить лидирующие нули
        return d;
    };
    const isValid = (d) => /^\d{8,15}$/.test(d);       // E.164: 8–15 цифр
    const phone = useMemo(() => normalize(raw), [raw]);

    const openWA = () => {
        setError('');
        const d = phone;
        if (!isValid(d)) {
            setError('Похоже, это не номер в международном формате. Проверь длину и код страны.');
            return;
        }
        addRecent(d);
        const url = `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
        location.href = url;
    };

    const pasteFromClipboard = async () => {
        try {
            const clip = await navigator.clipboard.readText();
            const match = clip.match(/\+?\d[\d\s().-]{6,}\d/g);
            const candidate = match ? match[0] : clip;
            const d = normalize(candidate);
            setRaw(d || clip);
        } catch {
            // нет доступа — пусть пользователь нажмёт Ctrl+V
        }
    };

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('zappi_recent') || '[]');
            if (Array.isArray(saved)) setRecent(saved);
        } catch { }
    }, []);

    return (
        <main className="bg-body-secondary min-vh-100 d-flex align-items-md-center">
            <div className="container-xxl py-5 py-md-0 px-4" style={{ maxWidth: 600 }}>
                <div className="mb-5" style={{display:"flex",justifyContent:"center"}}>
                    <img src="/logo.png" style={{width:150}} alt="" />
                </div>
                <h1 className="h3 fw-bold mb-2">Zappi — мгновенно в WhatsApp</h1>
                <p className="text-secondary small mt-3">Вставь номер — откроем чат без сохранения контакта.</p>

                <div className="row my-4">
                    {/* Номер + Вставить */}
                    <div className="col-12 mb-4">
                        <div className="input-group bg-body input-group-lg rounded-4 p-2">
                            <input
                                className={`form-control border-0 rounded-start-4 ${error ? 'is-invalid' : ''}`}
                                type="tel"
                                value={raw}
                                onChange={(e) => setRaw(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && openWA()}
                                placeholder="Введите номер: например, +7 707 123-45-67"
                                aria-label="Номер телефона"
                                style={{boxShadow:"none"}}
                            />
                            <button
                                type="button"
                                onClick={pasteFromClipboard}
                                className="btn btn-outline-primary border-0 rounded-4 d-flex gap-2 align-items-center"
                                aria-label="Вставить номер из буфера обмена"
                                title="Вставить из буфера"
                            >
                                <i className="bi bi-clipboard2" />
                                <span className="d-none d-sm-inline">Вставить</span>
                            </button>
                        </div>
                        <div className="form-text mt-4">Можно вставлять с пробелами/скобками — мы всё почистим.</div>
                        {error && <div className="invalid-feedback d-block">{error}</div>}
                    </div>

                    <div className="col-6">
                        <button
                            className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center gap-1"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#zappiExtra"
                            aria-expanded="false"
                            aria-controls="zappiExtra"
                            title="Показать дополнительные поля"
                        >
                            <i className="bi bi-chevron-down"></i>
                            Дополнительно
                        </button>
                    </div>
                    <div className="col-6 text-end">
                        <button
                            className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center gap-1"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#zappiHistory"
                            aria-expanded="false"
                            aria-controls="zappiHistory"
                            title="Показать историю"
                        >
                            <i className="bi bi-clock-history"></i>
                            История
                            {recent.length > 0 && <span className="badge bg-secondary ms-2">{recent.length}</span>}
                        </button>
                    </div>

                    {/* Дополнительно (спойлер) */}
                    <div className="col-12 mt-4">

                        <div className="collapse mb-4" id="zappiExtra">
                            <div className="card border-0 rounded-4 bg-secondary text-white">
                                <div className="card-body p-3">
                                    <label htmlFor="msg" className="form-label">Сообщение (необязательно)</label>
                                    <textarea
                                        id="msg"
                                        rows={3}
                                        className="form-control bg-body border-0 rounded-4"
                                        placeholder="Пример: Здравствуйте! Интересует доставка и стоимость."
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                    <div className="form-text text-white mt-3">Переносы строк сохранятся. Текст добавится в чат автоматически.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* История (спойлер) */}
                    <div className="col-12">
                        <div className="collapse mb-4" id="zappiHistory">
                            <div className="card border-0 rounded-4 bg-body">
                                <div className="card-body p-3">
                                    {recent.length === 0 ? (
                                        <p className="text-secondary mb-0 small">Пока пусто — номера появятся после первого открытия чата.</p>
                                    ) : (
                                        <>
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                {recent.map((n) => (
                                                    <div key={n} className="btn bg-body-secondary border btn-sm rounded-pill d-inline-flex align-items-center">
                                                        <button
                                                            className="btn btn-link p-0 text-decoration-none me-2"
                                                            onClick={() => setRaw(n)}
                                                            title="Подставить номер"
                                                            aria-label={`Подставить номер ${n}`}
                                                        >
                                                            {n}
                                                        </button>
                                                        <button
                                                            className="btn btn-link p-0 text-danger d-inline-flex align-items-center"
                                                            onClick={() => removeRecent(n)}
                                                            title="Удалить из истории"
                                                            aria-label={`Удалить номер ${n}`}
                                                        >
                                                            <i className="bi bi-x-circle"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="d-flex justify-content-end">
                                                <button
                                                    className="btn btn-outline-danger btn-sm rounded-3"
                                                    onClick={clearRecent}
                                                    title="Очистить всю историю"
                                                >
                                                    <i className="bi bi-trash me-1"></i> Очистить всё
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="col-12 d-grid">
                        <button
                            onClick={openWA}
                            className="btn btn-success btn-lg rounded-4 d-flex gap-2 justify-content-center"
                        >
                            <i className="bi bi-whatsapp me-1" /> Открыть WhatsApp
                        </button>
                    </div>
                </div>

                <p className="text-secondary mt-4 small">История хранится только на твоём устройстве и её можно очистить.</p>
            </div>
        </main>
    );
}
