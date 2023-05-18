// https://www.npmjs.com/package/node-fetch
const fetch = require('node-fetch')

async function forceFetch (url, options) {
  const res = await fetch(url, options)
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} - ${text}`)
  return [res, text];
}

async function main () {
  await forceFetch('http://localhost:18080/reset', {
    method: 'post',
  })

  for (let t = 0; t < 5; t++) {
    const promises = [];
    const team_name = `RM ${t}`
    console.log(team_name)
    for (let i = 0; i < 10; i++) {
      let prom = fetch('http://localhost:18080/players_plus', {
        method: 'post',
        body: JSON.stringify({
          name: `Player ${t} ${i}`,
          team_name,
        }),
        headers: {'Content-Type': 'application/json'}
      })
      promises.push(prom)
    }

    const results = await Promise.all(promises)
    console.log(`Successful count: ${results.filter(res => res.ok).length}`)
    console.log(`Failure count: ${results.filter(res => !res.ok).length}`)

    const count_res = await fetch(`http://localhost:18080/player_count?team_name=${team_name}`)
    console.log(count_res.status, await count_res.text())
  }
}

main();