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
  defer as observableDefer,
  Observable
} from "rxjs";
import castToObservable from "../../utils/castToObservable";
import {
  ICustomMediaKeys,
  MockMediaKeys,
} from "./MediaKeys";

/**
 * Set the MediaKeys given on the media element.
 * @param {HTMLMediaElement} elt
 * @param {Object} mediaKeys
 * @returns {*}
 */
function _setMediaKeys(
  elt : HTMLMediaElement,
  mediaKeys : MediaKeys|ICustomMediaKeys|null
) : any {
  if (mediaKeys instanceof MockMediaKeys) {
    if (typeof mediaKeys._setVideo === "function") {
      return mediaKeys._setVideo(elt);
    } else if (typeof mediaKeys._getNativeMediaKeys === "function") {
      const nativeMediaKeys = mediaKeys._getNativeMediaKeys();
      return elt.setMediaKeys(nativeMediaKeys);
    }
  }

  // don't get why TS doesn't get it here ...
  if (!(mediaKeys instanceof MockMediaKeys)) {
    if (elt.setMediaKeys) {
      return elt.setMediaKeys(mediaKeys);
    }

    if ((elt as any).WebkitSetMediaKeys) {
      return (elt as any).WebkitSetMediaKeys(mediaKeys);
    }

    if ((elt as any).mozSetMediaKeys) {
      return (elt as any).mozSetMediaKeys(mediaKeys);
    }

    if ((elt as any).msSetMediaKeys) {
      return (elt as any).msSetMediaKeys(mediaKeys);
    }
  }

  if (mediaKeys === null) {
    return;
  }
}

/**
 * Set the given MediaKeys on the given HTMLMediaElement.
 * Emits null when done then complete.
 * @param {HTMLMediaElement} elt
 * @param {Object} mediaKeys
 * @returns {Observable}
 */
export default function setMediaKeys$(
  elt : HTMLMediaElement,
  mediaKeys : MediaKeys|ICustomMediaKeys|null
) : Observable<unknown> {
  return observableDefer(() => castToObservable(_setMediaKeys(elt, mediaKeys)));
}
