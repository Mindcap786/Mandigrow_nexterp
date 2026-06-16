const downloadBlobSilent = () => { console.log("downloadBlobSilent"); };
const navigator = {
    share: async (opts) => { console.log("navigator.share", opts); return "promise_result"; }
};

const withFile = false;
const opts = { title: "title", text: "text" };
const filename = "file.pdf";

const sharePromise = withFile 
    ? navigator.share({ files: [], title: opts.title, text: opts.text })
    : (downloadBlobSilent(), navigator.share({ title: opts.title, text: (opts.text ? opts.text + '\n\n' : '') + `Please find the downloaded attached file: ${filename}` }));

console.log(sharePromise);
