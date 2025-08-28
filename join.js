// =================================================================
// 2. /join (Einfach und stabil)
// =================================================================
exports.handler = function (context, event, callback) {
  const CONFERENCE_NAME = 'StabileKonferenz456';
  const twiml = new Twilio.twiml.VoiceResponse();

  twiml.dial().conference(
    {
      beep: 'onEnter',
      endConferenceOnExit: false // Andere Teilnehmer beenden die Konferenz nicht
    },
    CONFERENCE_NAME
  );

  return callback(null, twiml);
};
