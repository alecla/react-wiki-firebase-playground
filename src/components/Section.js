import React from 'react';
import * as API from '../api';
import {markdown} from 'markdown';

export default class Section extends React.Component {

  constructor (props, context) {
    super(props, context);
    this.context = context;
    this.state = this.getState(props);
  }

  componentWillReceiveProps(nextProps) {
      var state = this.getState(nextProps);

      this.setState(state);
  }

  getState = props => ({
    locked: props.user && props.section.editor && props.user.username !== props.section.editor,
    editing: props.user && props.user.username === props.section.editor,
    content: props.section.content,
    html: props.section.content ? markdown.toHTML(props.section.content) : ''
  })

  render () {
    let content;

    if (this.state.editing) {
        content = <textarea className='twelve columns' defaultValue={this.state.content}
          onChange={this.updateContent} onBlur={this.save} />;
    } else {
        content = <span dangerouslySetInnerHTML={ { __html: this.state.html } } />;
    }

    console.log(this.state)

    let classes = ['row', 'section'];

    if (this.state.editing) classes.push('editing');
    if (this.props.user) classes.push( this.state.locked ? 'locked' : 'editable');

    return <section onClick={this.startEditing} className= { classes.join('')}>
      {content}
    </section>;
  }

  save = evt => {
    this.setState({ editing: false });

    API.pages.child(this.props.path).update({
      editor: null, //firebase will always remove null value
      content: this.state.content || null
    })
  }

  updateContent = evt => this.setState({ content: evt.target.value });

  startEditing = evt => {
    if (evt.target.tagName === 'A') { //if somone clicks link section will not still be locked
      var href = evt.target.getAttribute('href');
      if (href.indexOf('/page/') > -1) { //if internal link
        this.context.router.transitionTo(href);
        return evt.preventDefault();
      }

      return;
    }

    if (!this.props.user || this.state.editing || this.state.locked) return;
    this.setState({ editing: true});
    API.pages.child(this.props.path).update({
      editor: this.props.user.username
    });
  }
}

Section.contextTypes = {
  router: React.PropTypes.func.isRequired
};