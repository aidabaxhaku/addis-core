package org.drugis.addis.base;

/**
 * Created by connor on 18-5-16.
 */
public abstract class AbstractAddisException extends RuntimeException {
  public AbstractAddisException(String s) {
    super(s);
  }
}
