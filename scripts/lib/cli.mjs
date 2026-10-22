export function argumentsOf(argv=process.argv.slice(2)){
  const result={_:[]};for(let i=0;i<argv.length;i++){const value=argv[i];if(!value.startsWith('--'))result._.push(value);else{const [key,...rest]=value.slice(2).split('=');result[key]=rest.length?rest.join('='):argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:true;}}return result;
}
export async function run(main){try{await main();}catch(error){console.error(`Error: ${error.message}`);process.exitCode=1;}}
