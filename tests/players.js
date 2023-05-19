// https://www.npmjs.com/package/node-fetch
const fetch = require('node-fetch')

async function forceFetch (url, options) {
  const res = await fetch(url, options)
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} - ${text}`)
  return [res, text];
}

async function main () {
  await forceFetch('http://pg-locking-workshop-app-1:8080/reset', {
    method: 'post',
  })

  const promises = [];
  for (let i = 0; i < 10; i++) {
    let prom = fetch('http://pg-locking-workshop-app-1:8080/players', {
      method: 'post',
      body: JSON.stringify({
        name: `Player ${i}`,
        team_name: 'Real Madrid',
      }),
      headers: {'Content-Type': 'application/json'}
    })
    promises.push(prom)
  }

  const results = await Promise.all(promises)
  console.log(`Successful count: ${results.filter(res => res.ok).length}`)
  console.log(`Failure count: ${results.filter(res => !res.ok).length}`)

  const [count_res, count_msg] = await forceFetch('http://pg-locking-workshop-app-1:8080/player_count?team_name=Real Madrid')
  console.log(count_msg)
}

main();