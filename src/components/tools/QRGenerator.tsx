import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import QRCodeStyling, { type Options as QROptions } from 'qr-code-styling';
import { Download, ImagePlus, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { Button, CopyButton, Field, Hint, TextArea, TextInput } from '../ui';
import { downloadBlob, notifySuccess, siteUrl } from '../../lib/utils';

type ContentType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'phone';
type DotStyle = NonNullable<QROptions['dotsOptions']>['type'];
type Correction = NonNullable<NonNullable<QROptions['qrOptions']>['errorCorrectionLevel']>;
const qrByteLimits: Record<Correction, number> = { L: 2800, M: 2100, Q: 1500, H: 1200 };
const styleOptions: { label: string; value: DotStyle }[] = [
  { label: 'Classic', value: 'square' }, { label: 'Rounded', value: 'rounded' }, { label: 'Dots', value: 'dots' }, { label: 'Classy', value: 'classy' }, { label: 'Soft corners', value: 'extra-rounded' },
];

function escapeWifi(value: string) {
  return value.replace(/[\\;,:\"]/g, (character) => '\\' + character);
}

function makePayload(type: ContentType, values: Record<string, string>) {
  switch (type) {
    case 'url': {
      const value = values.content.trim();
      if (!value) return '';
      return /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
    }
    case 'wifi': {
      if (!values.ssid) return '';
      const security = values.security || 'WPA';
      const password = security === 'nopass' ? '' : `P:${escapeWifi(values.password)};`;
      const hidden = values.hidden ? 'H:true;' : '';
      return `WIFI:T:${security};S:${escapeWifi(values.ssid)};${password}${hidden};`;
    }
    case 'vcard': return values.firstName ? `BEGIN:VCARD\nVERSION:3.0\nN:${values.lastName};${values.firstName}\nFN:${values.firstName} ${values.lastName}\nTEL:${values.phone}\nEMAIL:${values.email}\nEND:VCARD` : '';
    case 'email': return values.email ? `mailto:${values.email}${values.subject || values.body ? `?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(values.body)}` : ''}` : '';
    case 'sms': return values.phone ? `SMSTO:${values.phone}:${values.body}` : '';
    case 'phone': return values.phone ? `tel:${values.phone}` : '';
    default: return values.content || '';
  }
}

function logoWithBacking(image: string, color: string) {
  if (color === 'transparent') return image;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect x="3" y="3" width="154" height="154" rx="26" fill="${color}"/><image href="${image}" x="22" y="22" width="116" height="116" preserveAspectRatio="xMidYMid meet"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}
function luminance(hex: string) {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function qrContrast(foreground: string, background: string) {
  if (!isHexColor(foreground) || !isHexColor(background)) return null;
  const levels = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (levels[0] + 0.05) / (levels[1] + 0.05);
}
function exceedsQrCapacity(data: string, correction: Correction) {
  return new TextEncoder().encode(data).length > qrByteLimits[correction];
}

function qrOptions(data: string, form: { foreground: string; background: string; dots: DotStyle; correction: Correction; gradient: boolean; logo: string; logoSize: number; logoBacking: string }, size: number): QROptions {
  const foreground = isHexColor(form.foreground) ? form.foreground : '#172554';
  const background = isHexColor(form.background) ? form.background : '#ffffff';
  return {
    type: 'svg', shape: 'square', width: size, height: size, margin: Math.max(12, Math.round(size * 0.045)), data: data || `${siteUrl}/`,
    qrOptions: { errorCorrectionLevel: form.correction },
    dotsOptions: form.gradient ? { type: form.dots, gradient: { type: 'linear', rotation: Math.PI / 4, colorStops: [{ offset: 0, color: foreground }, { offset: 1, color: '#8b5cf6' }] } } : { type: form.dots, color: foreground },
    cornersSquareOptions: { type: 'extra-rounded', color: foreground },
    cornersDotOptions: { type: 'dot', color: '#8b5cf6' },
    backgroundOptions: { color: background },
    image: form.logo ? logoWithBacking(form.logo, form.logoBacking) : undefined,
    imageOptions: { hideBackgroundDots: true, imageSize: form.logoSize / 100, margin: Math.round(size * 0.012), crossOrigin: 'anonymous' },
  };
}

function QRPreview({ data, form, label, frame = 'none', compact = false }: { data: string; form: Parameters<typeof qrOptions>[1]; label?: string; frame?: string; compact?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<QRCodeStyling | null>(null);
  const tooLong = Boolean(data) && exceedsQrCapacity(data, form.correction);
  useEffect(() => {
    if (!mountRef.current) return;
    if (!data || tooLong) {
      mountRef.current.replaceChildren();
      codeRef.current = null;
      return;
    }
    try {
      if (!codeRef.current) {
        const qr = new QRCodeStyling(qrOptions(data, form, compact ? 124 : 256));
        qr.append(mountRef.current);
        codeRef.current = qr;
      } else {
        codeRef.current.update(qrOptions(data, form, compact ? 124 : 256));
      }
    } catch { /* an empty/too-long draft should not break the rest of the form */ }
  }, [data, form, compact, tooLong]);
  useEffect(() => () => { mountRef.current?.replaceChildren(); codeRef.current = null; }, []);
  return <div className={`qr-preview-wrap frame-${frame} ${compact ? 'qr-preview-compact' : ''}`}>
    <div className="qr-canvas" aria-label="Live QR code preview" role="img"><div ref={mountRef} className="qr-code-mount"/>{!data ? <span className="qr-empty-preview">Add content to see your QR code</span> : tooLong ? <span className="qr-empty-preview">This is too much content for this error-correction level. Shorten it or choose a lower correction level.</span> : null}</div>
    {frame !== 'none' && <span className="qr-frame-label">{frame === 'custom' && label ? label : frame === 'scan' ? 'SCAN ME' : frame === 'open' ? 'OPEN HERE' : label || 'SCAN ME'}</span>}
  </div>;
}

export default function QRGenerator() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [contentType, setContentType] = useState<ContentType>('url');
  const [values, setValues] = useState<Record<string, string>>({ content: `${siteUrl}/`, ssid: '', password: '', security: 'WPA', hidden: '', firstName: '', lastName: '', phone: '', email: '', subject: '', body: '' });
  const [foreground, setForeground] = useState('#172554');
  const [background, setBackground] = useState('#ffffff');
  const [dots, setDots] = useState<DotStyle>('rounded');
  const [correction, setCorrection] = useState<Correction>('H');
  const [gradient, setGradient] = useState(false);
  const [logo, setLogo] = useState('');
  const [logoSize, setLogoSize] = useState(26);
  const [logoBacking, setLogoBacking] = useState('white');
  const [frame, setFrame] = useState('none');
  const [frameLabel, setFrameLabel] = useState('SCAN ME');
  const [exportSize, setExportSize] = useState(1200);
  const [bulkText, setBulkText] = useState(() => `https://example.com\n${siteUrl}/`);
  const [bulkGenerated, setBulkGenerated] = useState<string[]>([]);
  const [downloadState, setDownloadState] = useState('');

  const payload = useMemo(() => makePayload(contentType, values), [contentType, values]);
  const form = useMemo(() => ({ foreground, background, dots, correction, gradient, logo, logoSize, logoBacking }), [foreground, background, dots, correction, gradient, logo, logoSize, logoBacking]);
  const contrast = qrContrast(foreground, background);
  const update = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const onLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 3 * 1024 * 1024) { setDownloadState('Choose an image under 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result || ''));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const exportQr = async (data: string, extension: 'png' | 'svg' | 'pdf', name = 'quicgen-qr-code') => {
    if (!data) { setDownloadState('Add content before downloading your QR code.'); return; }
    if (exceedsQrCapacity(data, correction)) { setDownloadState('This content is too long for the selected correction level. Shorten it or choose a lower level.'); return; }
    if (!isHexColor(foreground) || !isHexColor(background)) { setDownloadState('Enter valid 6-digit HEX colors before downloading.'); return; }
    setDownloadState(`Preparing ${extension.toUpperCase()}…`);
    try {
      const exportCode = new QRCodeStyling(qrOptions(data, form, exportSize));
      let blob = await exportCode.getRawData(extension === 'pdf' ? 'png' : extension);
      if (!blob) throw new Error('Your file could not be prepared.');
      const label = frame === 'scan' ? 'SCAN ME' : frame === 'open' ? 'OPEN HERE' : frameLabel;
      if (frame !== 'none' && extension === 'png') blob = await framePng(blob as Blob, label, foreground, background);
      if (frame !== 'none' && extension === 'svg') blob = await frameSvg(blob as Blob, label, foreground, background);
      if (extension === 'pdf') {
        const [{ default: jsPDF }] = await Promise.all([import('jspdf')]);
        const url = await blobToDataUrl(blob as Blob);
        const document = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        document.setFontSize(18); document.text('Your QuicGen QR code', 105, 24, { align: 'center' });
        document.addImage(url, 'PNG', 30, 40, 150, 150);
        if (frame !== 'none') {
          document.setDrawColor(foreground); document.setLineWidth(.8); document.roundedRect(27, 37, 156, 156, 3, 3);
          document.setTextColor(foreground); document.setFontSize(12); document.text(label, 105, 205, { align: 'center' });
        }
        document.save(`${name}.pdf`);
        notifySuccess('download');
      } else {
        downloadBlob(blob as Blob, `${name}.${extension}`);
      }
      setDownloadState(`${extension.toUpperCase()} downloaded`);
      window.setTimeout(() => setDownloadState(''), 2000);
    } catch (error) {
      setDownloadState(error instanceof Error ? error.message : 'Could not create the file. Try a shorter QR code.');
    }
  };

  const generateBulk = () => {
    const allLines = bulkText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!allLines.length) { setBulkGenerated([]); setDownloadState('Add at least one item to generate a QR code.'); return; }
    const lines = allLines.slice(0, 30);
    setBulkGenerated(lines);
    setDownloadState(allLines.length > 30 ? 'Showing the first 30 entries.' : '');
  };

  const downloadBulk = async () => {
    if (!bulkGenerated.length) { generateBulk(); return; }
    if (!isHexColor(foreground) || !isHexColor(background)) { setDownloadState('Enter valid 6-digit HEX colors before downloading.'); return; }
    setDownloadState(`Preparing 0 of ${bulkGenerated.length} PNGs…`);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      for (let index = 0; index < bulkGenerated.length; index += 1) {
        if (exceedsQrCapacity(bulkGenerated[index], correction)) throw new Error(`QR code ${index + 1} is too long for the selected correction level.`);
        const code = new QRCodeStyling(qrOptions(bulkGenerated[index], form, exportSize));
        let image = await code.getRawData('png');
        if (!image) throw new Error(`Could not prepare QR code ${index + 1}.`);
        if (frame !== 'none') {
          const label = frame === 'scan' ? 'SCAN ME' : frame === 'open' ? 'OPEN HERE' : frameLabel;
          image = await framePng(image as Blob, label, foreground, background);
        }
        zip.file(`quicgen-qr-${String(index + 1).padStart(2, '0')}.png`, image as Blob);
        setDownloadState(`Preparing ${index + 1} of ${bulkGenerated.length} PNGs…`);
      }
      const archive = await zip.generateAsync({ type: 'blob' });
      downloadBlob(archive, 'quicgen-qr-codes.zip');
      setDownloadState(`${bulkGenerated.length} QR codes downloaded as a ZIP.`);
      window.setTimeout(() => setDownloadState(''), 3500);
    } catch (error) {
      setDownloadState(error instanceof Error ? error.message : 'Could not prepare the ZIP. Try fewer QR codes.');
    }
  };

  return <div className="tool-workspace qr-workspace">
    <div className="workspace-toolbar"><div className="workspace-tabs" role="group" aria-label="QR generation mode"><button type="button" className={mode === 'single' ? 'selected' : ''} aria-pressed={mode === 'single'} onClick={() => setMode('single')}>Single QR</button><button type="button" className={mode === 'bulk' ? 'selected' : ''} aria-pressed={mode === 'bulk'} onClick={() => setMode('bulk')}>Bulk create</button></div><span className="workspace-trust"><ShieldCheck size={14}/> Generated on this device</span></div>
    <div className="qr-workspace-grid">
      <div className="qr-controls">
        {mode === 'single' ? <>
          <div className="qr-content-type"><h3>What would you like to share?</h3><div className="qr-type-grid" role="group" aria-label="QR code content type">
            {(['url', 'text', 'wifi', 'vcard', 'email', 'sms', 'phone'] as ContentType[]).map((type) => <button type="button" key={type} className={contentType === type ? 'active' : ''} aria-pressed={contentType === type} onClick={() => setContentType(type)}>{type === 'vcard' ? 'Contact' : type === 'wifi' ? 'Wi-Fi' : type.toUpperCase() === 'SMS' ? 'SMS' : type[0].toUpperCase() + type.slice(1)}</button>)}
          </div></div>
          <div className="qr-input-fields">
            {(contentType === 'url' || contentType === 'text') && <Field label={contentType === 'url' ? 'Website URL' : 'Your text'} hint="The content embedded in your QR code. Check it carefully before sharing.">{contentType === 'url' ? <TextInput value={values.content} onChange={(event) => update('content', event.target.value)} placeholder="https://yourwebsite.com" inputMode="url" maxLength={1800}/> : <TextArea value={values.content} onChange={(event) => update('content', event.target.value)} placeholder="Type anything you’d like to share…" rows={3} maxLength={1800}/>}</Field>}
            {contentType === 'wifi' && <><div className="form-grid"><Field label="Network name (SSID)"><TextInput value={values.ssid} onChange={(event) => update('ssid', event.target.value)} placeholder="My Wi-Fi"/></Field><Field label="Password"><TextInput value={values.password} onChange={(event) => update('password', event.target.value)} placeholder="Network password"/></Field><Field label="Security"><select className="input" value={values.security} onChange={(event) => update('security', event.target.value)}><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">No password</option></select></Field></div><label className="toggle-row"><span><strong>Hidden network</strong><small>For Wi-Fi networks that don’t broadcast their name</small></span><input type="checkbox" checked={values.hidden === 'true'} onChange={(event) => update('hidden', event.target.checked ? 'true' : '')} aria-label="Hidden Wi-Fi network"/><i className="toggle-switch"/></label></>}
            {contentType === 'vcard' && <div className="form-grid"><Field label="First name"><TextInput value={values.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Alex"/></Field><Field label="Last name"><TextInput value={values.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Morgan"/></Field><Field label="Phone"><TextInput value={values.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+1 555 0100"/></Field><Field label="Email"><TextInput value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="alex@example.com" inputMode="email"/></Field></div>}
            {contentType === 'email' && <div className="form-grid"><Field label="Email address"><TextInput value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="hello@example.com" inputMode="email"/></Field><Field label="Subject"><TextInput value={values.subject} onChange={(event) => update('subject', event.target.value)} placeholder="Hello!"/></Field><Field label="Message"><TextArea value={values.body} onChange={(event) => update('body', event.target.value)} placeholder="Optional message" rows={2}/></Field></div>}
            {(contentType === 'sms' || contentType === 'phone') && <div className="form-grid"><Field label="Phone number"><TextInput value={values.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+1 555 0100" inputMode="tel"/></Field>{contentType === 'sms' && <Field label="Message"><TextArea value={values.body} onChange={(event) => update('body', event.target.value)} placeholder="Optional message" rows={2}/></Field>}</div>}
          </div>
          <div className="control-divider"/><div className="qr-section-title"><div><h3>Make it yours</h3><p>Style stays scannable—keep strong contrast.</p></div><span className="qr-mini-tip">✦ Live preview</span></div>
          <div className="form-grid qr-color-grid"><Field label="Foreground"><span className="color-field"><input type="color" value={isHexColor(foreground) ? foreground : '#172554'} onChange={(event) => setForeground(event.target.value)} aria-label="QR foreground color"/><TextInput value={foreground} onChange={(event) => setForeground(event.target.value)} maxLength={7}/></span></Field><Field label="Background"><span className="color-field"><input type="color" value={isHexColor(background) ? background : '#ffffff'} onChange={(event) => setBackground(event.target.value)} aria-label="QR background color"/><TextInput value={background} onChange={(event) => setBackground(event.target.value)} maxLength={7}/></span></Field></div>
          {contrast === null ? <p className="qr-contrast-note qr-contrast-warning" role="alert">Enter a valid 6-digit HEX value for both colors.</p> : <p className={`qr-contrast-note ${contrast < 4.5 ? 'qr-contrast-warning' : 'qr-contrast-good'}`} role="status"><ShieldCheck size={13}/>{contrast.toFixed(1)}:1 contrast {contrast < 4.5 ? '— increase contrast for reliable scanning.' : '— looks good for scanning.'}</p>}
          <div className="qr-option-row"><span className="option-label">Dot style <Hint text="The modules that make up your QR code. Rounded styles remain scannable when there is enough contrast."/></span><div className="style-pills">{styleOptions.map((style) => <button key={style.value} className={dots === style.value ? 'active' : ''} onClick={() => setDots(style.value!)}>{style.label}</button>)}</div></div>
          <label className="toggle-row"><span><strong>Color gradient</strong><small>Blend your foreground color into violet</small></span><input type="checkbox" checked={gradient} onChange={(event) => setGradient(event.target.checked)} aria-label="Use a color gradient"/><i className="toggle-switch"/></label>
          <div className="qr-option-row"><span className="option-label">Error correction <Hint text="Higher correction improves recovery from damage, and is recommended when a logo is placed in the code."/></span><div className="correction-row">{(['L', 'M', 'Q', 'H'] as Correction[]).map((level) => <button key={level} onClick={() => setCorrection(level)} className={correction === level ? 'active' : ''}><b>{level}</b><small>{{ L: '7%', M: '15%', Q: '25%', H: '30%' }[level]}</small></button>)}</div></div>
          <div className="qr-upload-row"><div><strong>Logo (optional)</strong><small>PNG, JPG or SVG · up to 3 MB</small></div><label className="button button-secondary upload-button"><ImagePlus size={15}/>{logo ? 'Replace logo' : 'Add logo'}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogo} hidden/></label></div>
          {logo && <div className="logo-config"><img src={logo} alt="Uploaded logo preview"/><label className="logo-size-control">Logo size <input type="range" min="16" max="38" value={logoSize} onChange={(event) => setLogoSize(Number(event.target.value))} aria-label="Logo size"/><span>{logoSize}%</span></label><Field label="Logo background"><select className="input" value={logoBacking} onChange={(event) => setLogoBacking(event.target.value)}><option value="white">White rounded tile</option><option value="#ffffff">White square</option><option value="transparent">Transparent</option><option value="#f1f5f9">Soft gray</option></select></Field><button className="icon-button remove-logo" onClick={() => setLogo('')} aria-label="Remove logo"><Trash2 size={16}/></button></div>}
          <div className="qr-upload-row"><div><strong>Frame &amp; label</strong><small>A little nudge to scan</small></div><div className="frame-select"><select className="input" value={frame} onChange={(event) => setFrame(event.target.value)} aria-label="QR frame"><option value="none">No frame</option><option value="scan">Scan me</option><option value="open">Open here</option><option value="custom">Custom label</option></select></div></div>
          {frame === 'custom' && <Field label="Your frame label"><TextInput value={frameLabel} onChange={(event) => setFrameLabel(event.target.value)} maxLength={32} placeholder="SCAN ME"/></Field>}
        </> : <div className="bulk-panel"><span className="bulk-panel-icon"><RotateCcw size={18}/></span><h3>Create a batch of QR codes</h3><p>One item per line. We’ll make up to 30 custom QR codes using your current design settings.</p><Field label="Content (one per line)" hint="Paste URLs, messages, or any text. Each non-empty line becomes its own QR code."><TextArea value={bulkText} onChange={(event) => setBulkText(event.target.value)} rows={7} placeholder={'https://example.com\nYour next link'}/></Field><div className="bulk-actions"><span>{bulkText.split(/\r?\n/).filter((line) => line.trim()).length} entries</span><Button onClick={generateBulk}>Create QR codes</Button></div>{downloadState && <p className="inline-status" role="status">{downloadState}</p>}{bulkGenerated.length > 0 && <div className="bulk-results"><div className="bulk-results-header"><strong>{bulkGenerated.length} QR codes ready</strong><Button variant="secondary" onClick={downloadBulk}><Download size={14}/>Download ZIP</Button></div><div className="bulk-grid">{bulkGenerated.map((item, index) => <div className="bulk-item" key={`${index}-${item}`}><QRPreview data={item} form={form} compact/><span className="bulk-item-text" title={item}>{item}</span><Button variant="quiet" onClick={() => exportQr(item, 'png', `quicgen-qr-${index + 1}`)}><Download size={14}/> PNG</Button></div>)}</div></div>}</div>}
      </div>
      {mode === 'single' && <aside className="qr-preview-panel"><div className="preview-panel-head"><div><span className="eyebrow">YOUR DESIGN</span><h3>Live preview</h3></div><span className="preview-status"><i/> Updating</span></div><div className="qr-stage"><QRPreview data={payload} form={form} frame={frame} label={frameLabel}/></div><div className="preview-payload"><div className="preview-payload-head"><span>QR CONTENT</span><CopyButton value={payload} label="Copy payload"/></div><p title={payload}>{payload || 'Add content to see your code'}</p></div><Field label="Export resolution" hint="Choose the pixel dimensions for PNG and PDF exports. SVG stays vector-sharp at any display size."><select className="input qr-export-size-select" value={exportSize} onChange={(event) => setExportSize(Number(event.target.value))} aria-label="Export resolution"><option value={512}>512 × 512 px · web</option><option value={1200}>1200 × 1200 px · standard</option><option value={2400}>2400 × 2400 px · print</option></select></Field><div className="download-actions"><Button onClick={() => exportQr(payload, 'png')}><Download size={16}/>Download PNG</Button><div className="download-secondary"><Button variant="secondary" onClick={() => exportQr(payload, 'svg')}>SVG</Button><Button variant="secondary" onClick={() => exportQr(payload, 'pdf')}>PDF</Button></div></div><span className="download-note">PNG / PDF export · {exportSize} × {exportSize} px <Hint text="PNG is ideal for sharing. SVG stays crisp at any size. PDF is ready to print."/></span><p className="qr-scan-tip"><ShieldCheck size={14}/> Always test-scan your finished code before printing.</p>{downloadState && <p className="inline-status" role="status">{downloadState}</p>}</aside>}
    </div>
  </div>;
}

async function framePng(blob: Blob, label: string, foreground: string, background: string): Promise<Blob> {
  const image = await createImageBitmap(blob);
  const padding = Math.round(image.width * 0.05);
  const labelHeight = Math.round(image.width * 0.13);
  const canvas = document.createElement('canvas');
  canvas.width = image.width + padding * 2;
  canvas.height = image.height + padding * 2 + labelHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not prepare the framed image.');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, padding, padding);
  context.strokeStyle = foreground;
  context.lineWidth = Math.max(3, Math.round(image.width * 0.004));
  context.strokeRect(padding / 2, padding / 2, image.width + padding, image.height + padding);
  context.fillStyle = foreground;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  let fontSize = Math.round(image.width * 0.038);
  context.font = `700 ${fontSize}px system-ui, sans-serif`;
  while (context.measureText(label).width > canvas.width - padding * 2 && fontSize > 12) {
    fontSize -= 2;
    context.font = `700 ${fontSize}px system-ui, sans-serif`;
  }
  context.fillText(label, canvas.width / 2, image.height + padding + labelHeight / 2, canvas.width - padding * 2);
  image.close();
  return new Promise((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Could not encode your framed PNG.')), 'image/png'));
}

async function frameSvg(blob: Blob, label: string, foreground: string, background: string): Promise<Blob> {
  const source = await blob.text();
  const svgStart = source.indexOf('<svg');
  const openEnd = source.indexOf('>', svgStart);
  const closeStart = source.lastIndexOf('</svg>');
  if (svgStart < 0 || openEnd < 0 || closeStart < 0) throw new Error('Could not frame the SVG export.');
  const opening = source.slice(svgStart, openEnd + 1);
  const viewBox = opening.match(/viewBox="([^"]+)"/)?.[1]?.split(/\s+/).map(Number);
  const width = viewBox?.[2] || 1200;
  const height = viewBox?.[3] || width;
  const padding = Math.round(width * 0.05);
  const labelHeight = Math.round(width * 0.13);
  const outerWidth = width + padding * 2;
  const outerHeight = height + padding * 2 + labelHeight;
  const contents = source.slice(openEnd + 1, closeStart);
  const safeColor = escapeXml(foreground);
  const safeBackground = escapeXml(background);
  const safeLabel = escapeXml(label);
  const framed = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}"><rect width="100%" height="100%" fill="${safeBackground}"/><rect x="${padding / 2}" y="${padding / 2}" width="${width + padding}" height="${height + padding}" rx="${Math.round(width * 0.02)}" fill="none" stroke="${safeColor}" stroke-width="${Math.max(3, Math.round(width * 0.004))}"/><svg x="${padding}" y="${padding}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${contents}</svg><text x="${outerWidth / 2}" y="${height + padding + labelHeight / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Arial,sans-serif" font-size="${Math.round(width * 0.038)}" font-weight="700" fill="${safeColor}">${safeLabel}</text></svg>`;
  return new Blob([framed], { type: 'image/svg+xml;charset=utf-8' });
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]!);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not prepare the PDF.'));
    reader.onerror = () => reject(new Error('Could not prepare the PDF.'));
    reader.readAsDataURL(blob);
  });
}
