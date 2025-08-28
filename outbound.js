// Shopify Flow 3er Konferenz: Erst Flow-Nummer, nach Verbindungsaufbau die beiden festen Nummern anrufen – keine Musik oder Ansage.

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const fromNumber = '+4915735982470';
  const conferenceName = "ShopKonferenz";
  const statusCallbackUrl = "https://silberkraft-outbound-5094.dublin.ie1.twil.io/status-callback"; // <- Setze deine Twilio Function-URL hier

  // Nummer aus Shopify Flow
  let firstNumber = event.toNumber;
  if (!firstNumber && event.body) {
    const params = new URLSearchParams(event.body);
    firstNumber = params.get('toNumber');
  }
  const validNumber = n => n && n.match(/^\+\d{10,15}$/);
  if (!validNumber(firstNumber)) {
    return callback("Error: toNumber is not valid");
  }

  // 1. Flow-Anrufer zu Konferenz ohne Musik oder Ansage einladen
  try {
    await client.calls.create({
      to: firstNumber,
      from: fromNumber,
      twiml: `
        <Response>
          <Dial>
            <Conference>${conferenceName}</Conference>
          </Dial>
        </Response>
      `,
      statusCallback: statusCallbackUrl,
      statusCallbackEvent: ['answered']
    });
    callback(null, {status: "initial_call_started", conference: conferenceName, participant: firstNumber});
  } catch (e) {
    callback(e);
  }
};

// Status Callback: Wird von Twilio aufgerufen, sobald der Flow-Anrufer verbunden ist.
// Ruft die beiden festen Nummern an und verbindet sie in dieselbe Konferenz – keine Musik, keine Ansage.
exports.handlerStatusCallback = async function(context, event, callback) {
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