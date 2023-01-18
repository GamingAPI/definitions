# Definitions
Contains all the AsyncAPI and OpenAPI documents for all the API's.


## Script

```
npm run setup:game --nuget_auth_token=123 --gh_token=123 --npm_token=123
```

## NATS topics

nats str add "everything" --subjects "v0.rust.servers.*.events.stopped,v0.rust.servers.*.events.started,v0.rust.servers.*.events.player.*.chatted,v0.rust.servers.*.events.wiped,v0.rust.servers.*.players.*.events.connected,v0.rust.servers.*.players.*.events.disconnected,v0.rust.servers.*.players.*.events.gatheredResources,v0.rust.servers.*.players.*.events.respawned,v0.rust.servers.*.players.*.events.combat.hit,v0.rust.servers.*.players.*.events.items.*.pickup,v0.rust.servers.*.players.*.events.items.*.loot,v0.rust.servers.*.players.*.events.items.*.crafted,v0.rust.servers.*.events.command,v0.rust.servers.*.players.*.events.reported,v0.rust.servers.*.players.*.events.unbanned,v0.rust.servers.*.players.*.events.banned" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard old --dupe-window="0s" --replicas 1 --no-deny-delete --no-deny-purge --no-allow-rollup

