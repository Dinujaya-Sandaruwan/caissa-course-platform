import { AlertCircle, ServerCrash } from "lucide-react";

export default function FatalErrorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-red-500/30">
      <div className="max-w-xl w-full">
        <div className="mb-8 text-red-500 flex justify-center">
          <ServerCrash className="w-24 h-24" />
        </div>

        <h1 className="text-4xl md:text-5xl font-mono font-bold text-white text-center mb-4 tracking-tight">
          FATAL_ERROR
        </h1>

        <div className="bg-slate-900 border border-red-500/20 rounded-xl p-6 shadow-2xl space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-red-400 font-mono font-bold text-lg mb-1">
                Database Connection Refused
              </h2>
              <p className="text-slate-400 font-mono text-sm leading-relaxed">
                The application encountered an unrecoverable error while
                attempting to connect to the primary database cluster.
              </p>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-red-300/80 overflow-x-auto whitespace-pre">
            {`Error Code: 0x80004005 (E_FAIL)
Connection String: mongodb+srv://***:***@cluster0.exmple.net/caissa?retryWrites=true&w=majority
Stack Trace:
  at Mongoose._promiseCallOptions (/app/node_modules/mongoose/lib/connection.js:847:11)
  at Mongoose.connect (/app/node_modules/mongoose/lib/index.js:406:21)
  at connectDB (/app/src/lib/mongoose.ts:22:20)
  at async handleRequest (/app/src/middleware.ts:45:5)

Details: Data store is empty. No collections found. Initialization aborted.`}
          </div>
        </div>

        <div className="text-center font-mono text-slate-500 text-sm">
          <p>Please contact system administrator immediately.</p>
          <p className="mt-2 text-slate-600">
            Incident ID:{" "}
            {Math.random().toString(36).substring(2, 10).toUpperCase()}-
            {Date.now().toString().slice(-6)}
          </p>
        </div>
      </div>
    </div>
  );
}
