#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

const projectName = process.argv[2] || "openprocessing-webgpu-ts";
const dest = path.join(process.cwd(), projectName);
const template = path.join(__dirname, "template");

fs.copy(template, dest)
  .then(() => {
    console.log(`✅ Project "${projectName}" has been created.`);
    console.log(`👉 Next steps:\n  cd ${projectName}\n  npm install\n  npm run build`);
  })
  .catch(err => {
    console.error("❌ Error creating project:", err);
  });

