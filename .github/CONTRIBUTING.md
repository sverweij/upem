## Contributing

So you want to contribute to upem? We already love you!

To make this as easy as possible for you, here's some simple guidelines:

### Reporting issues

- All **issues** are **welcome**.
  - These include bug reports, questions, feature requests and enhancement
    proposals
    [GitHub's issue tracker](https://github.com/sverweij/upem/issues)
    or
  - [GitLab's one](https://gitlab.com/sverweij/upem/issues)
    are the easiest way to submit them.
- To make it easier to reproduce an issue & concoct a solution that fits
  your expectation, we've made a [template](ISSUE_TEMPLATE.md)
- In turn, we try to **respond within a week**.  
  This might or might not include an actual code fix.

### Contributing code

- We prefer well documented
  **[pull requests](https://help.github.com/articles/creating-a-pull-request/)**
  based on the most recent version of the **develop** branch.
- Code quality
  - Additions pass the linting (as configured in this repo -
    `npm run lint:fix` will help you loads).
  - Unit tests (we use `node:test`) prove your code does what it intends.
  - Your code does not introduce regressions - `npm run check` proves this.
  - Code style (you know, petty things like indentations, where brackets go,
    how variables & parameters are named) fits in with the current code base.
- Plan to do something drastic?  
  Leave an
  [issue](https://github.com/sverweij/upem/issues/new) on GitHub
- upem is released with a [code of conduct](CODE_OF_CONDUCT.md), adapted
  from the [contributor covenant](http://contributor-covenant.org/).

### Legal

- the code you add will be subject to the
  [MIT](../LICENSE) license, just like the rest of upem
- the code you add is your own original work
