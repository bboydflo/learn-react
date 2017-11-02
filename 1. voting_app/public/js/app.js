class ProductList extends React.Component {
  state = {
    products: []
  };
  render() {
    
    // sort products by votes
    const sortedProducts = this.state.products.sort((a, b) =>(b.votes - a.votes));

    // use sorted collection instead of the original collection
    const prodComponents = sortedProducts.map(p => (
      <Product
        key={'product-' + p.id}
        id={p.id}
        title={p.title}
        description={p.description}
        url={p.url}
        votes={p.votes}
        submitterAvatarUrl={p.submitterAvatarUrl}
        productImageUrl={p.productImageUrl}
        onVote={this.handleProductUpVote}
      />
    ));
    return (
      <div className='ui unstackable items'>
        {prodComponents}
      </div>
    );
  }
  componentDidMount() {
    this.setState({ products: Seed.products });
  }
  handleProductUpVote = (productId) => {
    // search for the product id in the seed products
    // and upvote the prodcut with the `productId`
    // console.log(`Product with id ${productId} has been upvoted!`);
    const nextProducts = this.state.products.map(p => {
      if(p.id === productId) {
        return Object.assign({}, p, {
          votes: p.votes + 1
        });
      }
      return p;
    });
    this.setState({ products: nextProducts });
  }
}

class Product extends React.Component {
  handleUpVote = () => {
    this.props.onVote(this.props.id);
  }
  render() {
    return (
      <div className='item'>
        <div className='image'>
          <img src={this.props.productImageUrl} />
        </div>
        <div className='middle aligned content'>
          <div className='header'>
            <a onClick={this.handleUpVote}>
              <i className='large caret up icon'/>
            </a>
            {this.props.votes}
          </div>
          <div className='description'>
            <a href={this.props.url}>this.props.title</a>
            <p>{this.props.description}</p>
          </div>
          <div className='extra'>
            <span>Submitted by:</span>
            <img className='ui avatar image' src={this.props.submitterAvatarUrl} />
          </div>
        </div>
      </div>
    );
  }
  handleUpVote() {
    this.props.onVote(this.props.id);
  }
}

ReactDOM.render(<ProductList />, document.getElementById('content'));
