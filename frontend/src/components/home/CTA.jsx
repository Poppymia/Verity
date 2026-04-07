import React from 'react';
import Button from '../Button';
import { EXTENSION_ZIP_HREF } from '../../constants/extensionDownload';

const CTA = () => {
  return (
    <section className="cta">
      <h2>Ready to browse with confidence?</h2>
      <p>Join thousands who've stopped falling for misinformation</p>
      <Button
        variant="primary"
        size="large"
        href={EXTENSION_ZIP_HREF}
        download="verity-extension.zip"
        title="Unzip, then load the verity-extension folder via Chrome → Extensions → Load unpacked."
      >
        Download extension
      </Button>
    </section>
  );
};

export default CTA;