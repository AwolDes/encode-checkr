import { useState } from "react"
import { HiOutlineClipboardList, HiOutlineClipboardCheck } from "react-icons/hi"

function App() {
  enum Mode {
    Encode,
    Decode
  }
  const [value, setValue] = useState<String>('');
  const [mode, setMode] = useState<Mode>(Mode.Encode);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<String>('');

  const tryFunc = (func: (value: string) => string, param: string) => {
    try {
      return func(param);
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  };

  // convert a Unicode string to a string in which
  // each 16-bit unit occupies only one byte
  const toBinary = (value: string) => {
    const codeUnits = Uint16Array.from(
      { length: value.length },
      (element, index) => value.charCodeAt(index)
    );
    const charCodes = new Uint8Array(codeUnits.buffer);

    let result = "";
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });
    return result;
  }

  const fromBinary = (binary: string) => {
    const bytes = Uint8Array.from({ length: binary.length }, (element, index) =>
      binary.charCodeAt(index)
    );
    const charCodes = new Uint16Array(bytes.buffer);
  
    let result = "";
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });
    return result;
  }

  const encodingFunctions = [
    {
      label: 'Base64',
      encode: (value: string) => btoa(value),
      decode: (value: string) => atob(value),
    },
    {
      label: 'Base32',
      encode: (value: string) => btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'),
      decode: (value: string) => atob(value.replace(/-/g, '+').replace(/_/g, '/')),hexDecode: (value: string) => atob(value.replace(/-/g, '+').replace(/_/g, '/').split('').map((c) => String.fromCharCode(parseInt(c, 16))).join(''))
    },
    {
      label: 'Hex (Base 16)',
      encode: (value: string) => btoa(value).split('').map((c) => c.charCodeAt(0).toString(16)).join(''),
      decode: (value: string) => atob(value.split('').map((c) => String.fromCharCode(parseInt(c, 16))).join('')),
    },
    {
      label: 'Binary',
      encode: (value: string) => btoa(value).split('').map((c) => c.charCodeAt(0).toString(2)).join(''),
      decode: (value: string) => atob(value.split('').map((c) => String.fromCharCode(parseInt(c, 2))).join('')),
    },
    {
      label: 'ASCII',
      encode: (value: string) => btoa(toBinary(value)),
      decode: (value: string) => fromBinary(atob(value)),
    },
    {
      label: 'iso-8859-2',
      encode: (value: string) => new TextEncoder().encode(value),
      decode: (value: string) => new TextDecoder('iso-8859-2').decode(new TextEncoder().encode(value)),
    },
    {
      label: 'windows-874',
      encode: (value: string) => new TextEncoder().encode(value),
      decode: (value: string) => new TextDecoder('windows-874').decode(new TextEncoder().encode(value)),
    },
  ]

  const copyText = (text: string) => {
    if (text === '') return;
    setCopied(true);
    setCopiedText(text)
    navigator.clipboard.writeText(text).then(() => {
      setTimeout(() => setCopied(false), 500);
    });
  }

  return (
    <div className="mt-12">
      <div className="text-center">
        <h1 className="text-xl font-bold pb-2">Encode Checkr</h1>
        <p className="text-sm">A simple app to check what an encoided string might be, or to encode a string into multiple formats</p>
        <div>
          <input
            type="text"
            className="border-2 border-gray-300 p-2 rounded-lg mt-4"
            placeholder="Enter a string to encode or decode"
            value={value as string} onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="mt-4 flex space-x-3 justify-center">
          <div>
            <input className="mr-1" type="radio" name="mode" value="encode" checked={mode === Mode.Encode} onChange={() => setMode(Mode.Encode)} />
            <label htmlFor="encode">Encode</label>
          </div>
          <div>
            <input className="mr-1" type="radio" name="mode" value="decode" checked={mode === Mode.Decode} onChange={() => setMode(Mode.Decode)} />
            <label htmlFor="decode">Decode</label>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 p-6">
        {encodingFunctions.map((encodingFunction) => {
          const encodedValue = mode === Mode.Encode ? tryFunc(encodingFunction.encode, (value as string)) : tryFunc(encodingFunction.decode, (value as string));
          const hexEncodedValue = mode === Mode.Encode ? tryFunc(encodingFunction.hexEncode, (value as string)) : tryFunc(encodingFunction.hexDecode, (value as string));
          return (
            <div className="border-2 border-gray-300 p-4 rounded-lg">
              <h2 className="text-lg font-bold">{encodingFunction.label}</h2>
              <div className="mt-4">
                <div>
                  <div className="flex-1 cursor-pointer" onClick={(e) => copyText(encodedValue)}>
                    <label htmlFor="hex">Value</label>
                    <div className="flex justify-center">
                      <input
                        type="text"
                        className="border-2 my-2 cursor-pointer border-gray-300 p-2 rounded-lg w-full"
                        value={encodedValue}
                        readOnly
                      />
                      <p className="text-2xl">
                        {copied && copiedText === encodedValue && copiedText !== '' ? <HiOutlineClipboardCheck className="inline h-full" /> : <HiOutlineClipboardList className="inline h-full" />}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        )}
      </div>
    </div>
  )
}

export default App
