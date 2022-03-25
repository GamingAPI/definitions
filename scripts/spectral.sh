#/bin/sh

spectral lint ./documents/*.asyncapi.json --ruleset ./.spectral.yaml --fail-severity "warn"