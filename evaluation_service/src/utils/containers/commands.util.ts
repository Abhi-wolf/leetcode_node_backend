export const commands = {
  python: function (code: string, input: string) {
    const runCommand = `echo '${code}' > test.py && echo '${input}' > input.txt && python3 test.py < input.txt`;
    return ["/bin/bash", "-c", runCommand];
  },
  cpp: function (code: string, input: string) {
    const runCommand = `echo '${code}' > test.cpp && echo '${input}' > input.txt && g++ test.cpp -o test && ./test < input.txt`;
    return ["/bin/bash", "-c", runCommand];
  },

  js: function (code: string, input: string) {
    const runCommand = `echo '${code}' > test.js && echo '${input}' > input.txt && node test.js < input.txt`;
    return ["/bin/sh", "-c", runCommand]; // node alpine:image doesn't have bash
  },
};
