
/**
 * Copyright 2015 CANAL+ Group
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  concat as observableConcat,
  Observable,
  of as observableOf,
} from "rxjs";
import {
  switchMap,
  take,
} from "rxjs/operators";
import {
  shouldValidateMetadata,
  shouldWaitForDataBeforeLoaded,
} from "../../compat";
import { MediaError } from "../../errors";
import filterMap from "../../utils/filter_map";
import SegmentBuffersStore from "../segment_buffers";
import EVENTS from "./events_generators";
import { IInitialPlayEvent } from "./initial_seek_and_play";
import { IInitClockTick, ILoadedEvent, IWarningEvent } from "./types";

/**
 * Returns `true` if the content can be considered loaded.
 * That is:
 *   - A potential initial seek and play call has been performed.
 *   - There is media data to play.
 *   - Playing the content is possible.
 *
 * @param {Object} tick - The last "tick" from the clock
 * @param {boolean} performedInitialSeekAndPlay - If `true` both the initial
 * seek and play operations, if needed, have been performed. The content is
 * not considered loaded until this is the case.
 * @param {boolean} isDirectfile - `true` if this is a directfile content
 */
export default function isContentLoaded(
  clock$ : Observable<IInitClockTick>,
  play$ : Observable<IInitialPlayEvent>,
  mediaElement : HTMLMediaElement,
  segmentBuffersStore : SegmentBuffersStore | null,
  isDirectfile : boolean
) : Observable<IWarningEvent | ILoadedEvent> {
  return play$.pipe(switchMap((evt) => {
    if (evt.type === "warning") {
      return observableOf(evt);
    }
    const emitLoadedEvt$ = clock$.pipe(
      filterMap<IInitClockTick, ILoadedEvent, null>((tick) => {
        if (tick.rebuffering !== null ||
            tick.freezing !== null ||
            tick.readyState === 0)
        {
          return null;
        }

        if (!shouldWaitForDataBeforeLoaded(isDirectfile,
                                           mediaElement.hasAttribute("playsinline")))
        {
          return mediaElement.duration > 0 ? EVENTS.loaded(segmentBuffersStore) :
                                             null;
        }

        if (tick.readyState >= 1 && tick.currentRange !== null) {
          if (!shouldValidateMetadata() || mediaElement.duration > 0) {
            return EVENTS.loaded(segmentBuffersStore);
          }
          return null;
        }
        return null;
      }, null),
      take(1));

    if (shouldValidateMetadata() && mediaElement.duration === 0) {
      const error = new MediaError("MEDIA_ERR_NOT_LOADED_METADATA",
                                   "Cannot load automatically: your browser " +
                                   "falsely announced having loaded the content.");
      return observableConcat(observableOf(EVENTS.warning(error)),
                              emitLoadedEvt$);
    }
    return emitLoadedEvt$;
  }));
}
