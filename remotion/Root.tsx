import React from "react";
import { Composition } from "remotion";
import { AnimationComposition } from "../components/AnimationComposition";
import { DEFAULT_PROJECT } from "../lib/animation-schema";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="StockAnimation"
    component={AnimationComposition}
    durationInFrames={DEFAULT_PROJECT.durationSeconds * DEFAULT_PROJECT.fps}
    fps={DEFAULT_PROJECT.fps}
    width={DEFAULT_PROJECT.width}
    height={DEFAULT_PROJECT.height}
    defaultProps={{ project: DEFAULT_PROJECT }}
    calculateMetadata={({ props }) => ({
      durationInFrames: props.project.scenes.reduce(
        (total, scene) => total + scene.durationSeconds * props.project.fps,
        0,
      ),
    })}
  />
);
