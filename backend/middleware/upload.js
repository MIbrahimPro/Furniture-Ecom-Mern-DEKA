// middleware/uploadMiddleware.js (or wherever you keep it)
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads'); // Root directory for all uploads

// Helper: ensure a directory exists
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Compute destination based on type/subtype
// This returns a FILE SYSTEM path (uses platform-specific slashes)
function getDest(type) {
    const dest = path.join(UPLOAD_ROOT, type);
    ensureDir(dest);
    return dest;
}


// Helper: Converts a file system path to a web-friendly URL path (forward slashes, relative to UPLOAD_ROOT)
// This is what you'd save in your database.
function convertFsPathToWebPath(filePath) {
    const rel = path.relative(UPLOAD_ROOT, filePath);
    return rel.replace(/\\/g, '/');
}


const storage = multer.diskStorage({
    destination(req, file, cb) {
        // e.g. UPLOAD_ROOT/theme or UPLOAD_ROOT/category or UPLOAD_ROOT/products
        cb(null, getDest(file.fieldname || req.params.type));
    },
    filename(req, file, cb) {
        let ext = path.extname(file.originalname);
        if (!ext && file.mimetype) {
            // fallback: try to guess from mimetype
            const mime = file.mimetype.split('/').pop();
            ext = '.' + mime;
        }
        const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, name);
    }
});

const uploadMiddleware = (type) => {
    // For 'category', always use 'icon' as the field name, but save in 'category' folder
    if (type === 'category') {
        return multer({
            storage: multer.diskStorage({
                destination(req, file, cb) {
                    cb(null, getDest('category'));
                },
                filename(req, file, cb) {
                    let ext = path.extname(file.originalname);
                    if (!ext && file.mimetype) {
                        const mime = file.mimetype.split('/').pop();
                        ext = '.' + mime;
                    }
                    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
                    cb(null, name);
                }
            })
        }).single('icon');
    }
    // For other types, use the type as both field and folder
    return multer({ storage }).single(type);
};

function uploadMiddlewareuu(type) {
    const customStorage = multer.diskStorage({
        destination(req, file, cb) {
            // force every file into uploads/<type>/
            cb(null, getDest(type));
        },
        filename(req, file, cb) {
            let ext = path.extname(file.originalname);
            if (!ext && file.mimetype) {
                const mime = file.mimetype.split('/').pop();
                ext = '.' + mime;
            }
            const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
            cb(null, name);
        }
    });

    return multer({ storage: customStorage });
}

function deleteImage(type, filename) {
    if (!filename) return;
    const filePath = path.join(getDest(type), filename);
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); }
        catch (e) { console.error(`Failed to delete ${filePath}:`, e); }
    }
}

// Replace: delete oldFilename then return newFile.filename
function replaceImage(type, oldFilename, newFile) {
    deleteImage(type, oldFilename);
    return newFile.filename;
}


function copyProductImageToOrder(productFilename) {
    if (!productFilename) return null;
    const src = path.join(getDest('products'), productFilename);
    const dst = path.join(getDest('orders'), productFilename);
    try {
        ensureDir(path.dirname(dst));
        fs.copyFileSync(src, dst);
        return convertFsPathToWebPath(dst);
    } catch (e) {
        console.error(`Error copying ${src}→${dst}:`, e);
        return null;
    }
}

module.exports = {
    uploadMiddleware,
    uploadMiddlewareuu,
    deleteImage,
    replaceImage,
    copyProductImageToOrder,
    convertFsPathToWebPath,
};