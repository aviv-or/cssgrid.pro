import React, { Component } from "react";
import glamorous from "glamorous";
import { every, getOr, values, pipe, map, get, reduce } from "lodash/fp";
import Challenge from "./Challenge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Header from "./Header";

const challenges = require("../../data/challenges");

const Wrapper = glamorous("div", { displayName: "App" })({
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexFlow: "column nowrap"
});
const SubmitContainer = glamorous("div", { displayName: "SubmitContainer" })({
  position: "relative",

  "& svg": {
    position: "absolute",
    right: "-10px"
  }
});
const SubmitError = glamorous.div({
  color: "red",
  fontSize: 14,
  textTransform: "uppercase",
  margin: ".5em 0",
  textAlign: "right"
});

class ChallengeView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showingIntro: false,
      challengeIndex: null,
      challenge: null,
      hasSubmitError: false
    };
  }

  componentDidMount() {
    this.loadLevel();
  }

  componentWillReceiveProps(nextProps) {
    this.loadLevel(nextProps);
  }

  onStylesChanged = styles => {
    this.setState({
      challenge: {
        ...this.state.challenge,
        styles
      },
      hasSubmitError: false
    });
  };

  onIntroConfirm = () => {
    this.setState({ showingIntro: false });
  };

  onHelpClick = () => {
    this.setState({ showingIntro: true });
  };

  gotoNextChallenge = () => {
    const { history } = this.props;
    const { challengeIndex } = this.state;
    const nextChallengeIndex = challengeIndex + 1;
    const nextChallenge = challenges[nextChallengeIndex];

    if (nextChallenge) {
      history.push(`/challenge/${nextChallengeIndex}`);
    } else {
      history.push("/theend");
    }
  };

  loadLevel = (props = this.props) => {
    const idParam = props.match.params.id;
    const challengeIndex = parseInt(idParam, 10);
    const challenge = challenges[challengeIndex];
    const { history } = this.props;

    if (!challenge) {
      history.push("/");
    } else {
      this.setState({
        challengeIndex,
        challenge,
        // showingIntro: !!challenge.introduction,
        hasSubmitError: false
      });
    }
  };

  onLevelSubmit = () => {
    const allFieldsAreValid = pipe(
      values,
      map(get("properties")),
      map(values),
      every(get("valid"))
    )(this.state.challenge.styles);

    if (allFieldsAreValid) {
      this.gotoNextChallenge();
    } else {
      this.setState({ hasSubmitError: true });
    }
  };

  render() {
    const { challenge, showingIntro, hasSubmitError } = this.state;

    if (!challenge) return null;

    const { title, markup, styles } = challenge;

    return (
      <Wrapper>
        <Header>
          <h1>{title}</h1>
          {hasSubmitError && <SubmitError>That's not right!</SubmitError>}
          <SubmitContainer>
            <Button inverted onClick={this.onHelpClick}>
              ?
            </Button>
            <Button
              large
              primary
              disabled={hasSubmitError}
              onClick={this.onLevelSubmit}
            >
              {hasSubmitError ? "🙅" : "Submit!"}
            </Button>
          </SubmitContainer>
        </Header>
        <Challenge
          markup={markup}
          styles={styles}
          onStylesChanged={this.onStylesChanged}
        />
        <Modal
          content={challenge.introduction}
          visible={showingIntro}
          onConfirm={this.onIntroConfirm}
          confirmLabel="Got it!"
          markdown
        />
      </Wrapper>
    );
  }
}

export default ChallengeView;
