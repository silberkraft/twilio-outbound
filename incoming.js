exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();

  // --- Konfiguration ---
  const CONFERENCE_NAME = 'StabileKonferenz456';
  const FROM_NUMBER     = '+4915735982470';
  const PERSONS_TO_CALL = ['+4961967833979', '+17373673783']; // Mehrere Nummern! +4961967833979 ist Zadarma
  const JOIN_URL        = `https://${context.DOMAIN_NAME}/join`;

  // --- TwiML für den Anrufer (bei eingehendem Anruf) ---
  const twiml = new Twilio.twiml.VoiceResponse();

  twiml.dial().conference({
    waitUrl: 'https://twimlets.com/holdmusic?Bucket=com.twilio.music.classical',
    startConferenceOnEnter: true,
    endConferenceOnExit: true,
  }, CONFERENCE_NAME);

  // --- Starte die ausgehenden Anrufe ---
  try {
    for (const person of PERSONS_TO_CALL) {
      await client.calls.create({
        to: person,
        from: FROM_NUMBER,
        url: JOIN_URL
      });
    }
    console.log('INFO: Alle ausgehenden Anrufe wurden erfolgreich gestartet.');
  } catch (e) {
    console.error('FATALER FEHLER beim Starten der ausgehenden Anrufe:', e.message);
  }

  return callback(null, twiml);
};