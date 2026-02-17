const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class CodeRunner {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'code-runner');
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  async runJavaScript(code, input) {
    return new Promise(async (resolve) => {
      try {
        const tempFile = path.join(this.tempDir, `code_${Date.now()}.js`);
        await fs.writeFile(tempFile, code);

        const child = spawn('node', [tempFile], {
          timeout: 5000, // 5 second timeout
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';
        let timedOut = false;

        const timeout = setTimeout(() => {
          timedOut = true;
          child.kill();
          resolve({
            success: false,
            output: '',
            error: 'Time Limit Exceeded',
            runtime: 5000
          });
        }, 5000);

        if (input) {
          child.stdin.write(input);
          child.stdin.end();
        }

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          error += data.toString();
        });

        child.on('close', (code) => {
          clearTimeout(timeout);
          
          if (timedOut) return;

          // Clean up temp file
          fs.unlink(tempFile).catch(() => {});

          if (code !== 0 || error) {
            resolve({
              success: false,
              output: output,
              error: error || `Process exited with code ${code}`,
              runtime: 0
            });
          } else {
            resolve({
              success: true,
              output: output.trim(),
              error: '',
              runtime: 0
            });
          }
        });

        child.on('error', (err) => {
          clearTimeout(timeout);
          fs.unlink(tempFile).catch(() => {});
          resolve({
            success: false,
            output: '',
            error: err.message,
            runtime: 0
          });
        });

      } catch (error) {
        resolve({
          success: false,
          output: '',
          error: error.message,
          runtime: 0
        });
      }
    });
  }

  async runPython(code, input) {
    return new Promise(async (resolve) => {
      try {
        const tempFile = path.join(this.tempDir, `code_${Date.now()}.py`);
        await fs.writeFile(tempFile, code);

        const child = spawn('python', [tempFile], {
          timeout: 5000,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';
        let timedOut = false;

        const timeout = setTimeout(() => {
          timedOut = true;
          child.kill();
          resolve({
            success: false,
            output: '',
            error: 'Time Limit Exceeded',
            runtime: 5000
          });
        }, 5000);

        if (input) {
          child.stdin.write(input);
          child.stdin.end();
        }

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          error += data.toString();
        });

        child.on('close', (code) => {
          clearTimeout(timeout);
          
          if (timedOut) return;

          fs.unlink(tempFile).catch(() => {});

          if (code !== 0 || error) {
            resolve({
              success: false,
              output: output,
              error: error || `Process exited with code ${code}`,
              runtime: 0
            });
          } else {
            resolve({
              success: true,
              output: output.trim(),
              error: '',
              runtime: 0
            });
          }
        });

        child.on('error', (err) => {
          clearTimeout(timeout);
          fs.unlink(tempFile).catch(() => {});
          resolve({
            success: false,
            output: '',
            error: err.message,
            runtime: 0
          });
        });

      } catch (error) {
        resolve({
          success: false,
          output: '',
          error: error.message,
          runtime: 0
        });
      }
    });
  }

  async runJava(code, input) {
    return new Promise(async (resolve) => {
      try {
        // Extract class name from Java code
        const classNameMatch = code.match(/public\s+class\s+(\w+)/);
        if (!classNameMatch) {
          return resolve({
            success: false,
            output: '',
            error: 'No public class found in Java code',
            runtime: 0
          });
        }

        const className = classNameMatch[1];
        const tempFile = path.join(this.tempDir, `${className}.java`);
        await fs.writeFile(tempFile, code);

        // Compile Java code
        exec(`javac ${tempFile}`, { cwd: this.tempDir, timeout: 10000 }, async (compileError) => {
          if (compileError) {
            await fs.unlink(tempFile).catch(() => {});
            return resolve({
              success: false,
              output: '',
              error: `Compilation Error: ${compileError.message}`,
              runtime: 0
            });
          }

          // Run compiled Java code
          const child = spawn('java', [className], {
            cwd: this.tempDir,
            timeout: 5000,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let output = '';
          let error = '';
          let timedOut = false;

          const timeout = setTimeout(() => {
            timedOut = true;
            child.kill();
            resolve({
              success: false,
              output: '',
              error: 'Time Limit Exceeded',
              runtime: 5000
            });
          }, 5000);

          if (input) {
            child.stdin.write(input);
            child.stdin.end();
          }

          child.stdout.on('data', (data) => {
            output += data.toString();
          });

          child.stderr.on('data', (data) => {
            error += data.toString();
          });

          child.on('close', async (code) => {
            clearTimeout(timeout);
            
            if (timedOut) return;

            // Clean up files
            try {
              await fs.unlink(tempFile);
              await fs.unlink(path.join(this.tempDir, `${className}.class`));
            } catch (e) {}

            if (code !== 0 || error) {
              resolve({
                success: false,
                output: output,
                error: error || `Process exited with code ${code}`,
                runtime: 0
              });
            } else {
              resolve({
                success: true,
                output: output.trim(),
                error: '',
                runtime: 0
              });
            }
          });

          child.on('error', async (err) => {
            clearTimeout(timeout);
            try {
              await fs.unlink(tempFile);
              await fs.unlink(path.join(this.tempDir, `${className}.class`));
            } catch (e) {}
            resolve({
              success: false,
              output: '',
              error: err.message,
              runtime: 0
            });
          });
        });

      } catch (error) {
        resolve({
          success: false,
          output: '',
          error: error.message,
          runtime: 0
        });
      }
    });
  }

  async runCpp(code, input) {
    return new Promise(async (resolve) => {
      try {
        const tempFile = path.join(this.tempDir, `code_${Date.now()}.cpp`);
        const executable = tempFile.replace('.cpp', '.exe');
        await fs.writeFile(tempFile, code);

        // Compile C++ code
        exec(`g++ ${tempFile} -o ${executable}`, { timeout: 10000 }, async (compileError) => {
          if (compileError) {
            await fs.unlink(tempFile).catch(() => {});
            return resolve({
              success: false,
              output: '',
              error: `Compilation Error: ${compileError.message}`,
              runtime: 0
            });
          }

          // Run compiled executable
          const child = spawn(executable, [], {
            timeout: 5000,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let output = '';
          let error = '';
          let timedOut = false;

          const timeout = setTimeout(() => {
            timedOut = true;
            child.kill();
            resolve({
              success: false,
              output: '',
              error: 'Time Limit Exceeded',
              runtime: 5000
            });
          }, 5000);

          if (input) {
            child.stdin.write(input);
            child.stdin.end();
          }

          child.stdout.on('data', (data) => {
            output += data.toString();
          });

          child.stderr.on('data', (data) => {
            error += data.toString();
          });

          child.on('close', async (code) => {
            clearTimeout(timeout);
            
            if (timedOut) return;

            // Clean up files
            try {
              await fs.unlink(tempFile);
              await fs.unlink(executable);
            } catch (e) {}

            if (code !== 0 || error) {
              resolve({
                success: false,
                output: output,
                error: error || `Process exited with code ${code}`,
                runtime: 0
              });
            } else {
              resolve({
                success: true,
                output: output.trim(),
                error: '',
                runtime: 0
              });
            }
          });

          child.on('error', async (err) => {
            clearTimeout(timeout);
            try {
              await fs.unlink(tempFile);
              await fs.unlink(executable);
            } catch (e) {}
            resolve({
              success: false,
              output: '',
              error: err.message,
              runtime: 0
            });
          });
        });

      } catch (error) {
        resolve({
          success: false,
          output: '',
          error: error.message,
          runtime: 0
        });
      }
    });
  }

  async runCode(code, language, input) {
    await this.ensureTempDir();

    switch (language) {
      case 'javascript':
        return await this.runJavaScript(code, input);
      case 'python':
        return await this.runPython(code, input);
      case 'java':
        return await this.runJava(code, input);
      case 'cpp':
        return await this.runCpp(code, input);
      case 'c':
        return await this.runCpp(code, input); // C and C++ use same method for now
      default:
        return {
          success: false,
          output: '',
          error: `Unsupported language: ${language}`,
          runtime: 0
        };
    }
  }

  // Clean up temp directory (call this periodically)
  async cleanup() {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new CodeRunner();