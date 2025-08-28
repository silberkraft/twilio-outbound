// Status Callback: Wird von Twilio aufgerufen, sobald der Flow-Anrufer verbunden ist.
// Ruft die beiden festen Nummern an und verbindet sie in dieselbe Konferenz – keine Musik, keine Ansage.
exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const fromNumber = '+4915735982470';
  const conferenceName = "ShopKonferenz";
  const fixedNumbers = [
    '+4961967833979',
    '+17373673783'
  ];
  // Prüfen, ob der erste Call angenommen wurde
  if (event.CallStatus === 'answered' || event.CallStatus === 'in-progress') {
    try {
      await Promise.all(fixedNumbers.map(number => client.calls.create({
        to: number,
        from: fromNumber,
        twiml: `
          <Response>
            <Dial>
              <Conference>${conferenceName}</Conference>
            </Dial>
          </Response>
        `
      })));
      callback(null, {status: "other_calls_started", conference: conferenceName, participants: fixedNumbers});
    } catch (e) {
      callback(e);
    }
  } else {
    callback(null, {status: "not_answered", info: event.CallStatus});
  }
};
